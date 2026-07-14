import { getAllByCategoryById } from "./features/productService.js";
import { getAllTables, UpdateTable, getTableById } from "./features/tableService.js";
import {
    GetTableUnpaidOrdersByTableNumber,
    UpdateOrder,
    GetAllOrderItemsByOrderId,
    AddNewOrder,
    AddOrderItem,
    UpdateItem,
    RemoveItem,
    RemoveAllItems
} from "./features/orderService.js";

const params = new URLSearchParams(window.location.search);
const UseingSystemName = params.get("UseingSystemName");
document.getElementById("useingSystemName").innerText = UseingSystemName;

let currentOrder;
let currentTable;
let CategoryById = 1;
const OrderIdEle = document.getElementById("orderId");
const TableNumberEle = document.getElementById("tableNumber");
const OrderTotalAmountEle = document.getElementById("orderTotalAmount");
const SendOrderEle = document.getElementById("sendOrder");
const CanselOrderEle = document.getElementById("canselOrder");
const Logout = document.getElementById("logout");
const OrderItemsEle = document.getElementById("orderItems");
const ProductsEle = document.getElementById("products");
const TablesEle = document.getElementById("tables");
const TableBox = document.getElementById("tableBox");
const CategoriesBtns = document.querySelectorAll(".categoryBtn");

await renderTables();

await renderProductsByCategoryById(1);

await categorySelect();

async function categorySelect() {
    for (const btn of CategoriesBtns) {
        btn.addEventListener("click", async () => {
            CategoriesBtns.forEach(e => e.classList.remove("active"));
            btn.classList.add("active");
            await renderProductsByCategoryById(btn.innerText);
        });
    }
}

async function addNewOrder() {
    currentOrder = await AddNewOrder(UseingSystemName, currentTable.number);
    OrderIdEle.innerText = currentOrder.id;
}

async function addOrderItem(name, price, quantity) {
    if (currentTable == null)
        return alert("ℹ️ Please select table befor adding any items to order");

    try {
        if (currentOrder == null) {
            await addNewOrder();
            await AddOrderItem(currentOrder.id, name, "", price, quantity);
            await renderOrderItems(currentOrder.id);
            return;
        }
        await AddOrderItem(currentOrder.id, name, "", price, quantity);
        await renderOrderItems(currentOrder.id);
    }
    catch (err) {
        alert("⚠️ " + err.message);
    }
}

async function renderOrderItems(orderId) {
    currentOrder.total = 0;
    const items = await GetAllOrderItemsByOrderId(orderId);
    OrderItemsEle.innerHTML = "";

    for (const i of items) {
        OrderItemsEle.insertAdjacentHTML("beforeend", `
            <div class="item">
                <div class="info">
                    <div class="details">
                        <span>${i.quantity}</span>
                        <span>${i.name}</span>
                    </div>
                    <div class="controls">
                        <button id="save-item-${i.id}"><img src="imgs/18442.png" alt=""></button>
                        <button id="remove-item-${i.id}"><img src="imgs/1345874.png" alt=""></button>
                    </div>
                </div>
                <div class="description">
                    <input id="description-item-${i.id}" type="text" value="${i.description}">
                </div>
            </div>      
        `);

        document.getElementById(`save-item-${i.id}`).addEventListener("click", async () => {
            let description = document.getElementById(`description-item-${i.id}`).value;
            await UpdateItem(i.id, i.orderId, i.name, description, i.price, i.quantity);
            renderOrderItems(orderId);
        });

        document.getElementById(`remove-item-${i.id}`).addEventListener("click", async () => {
            await RemoveItem(i.id);
            renderOrderItems(orderId);
        });
        currentOrder.total += (i.price * i.quantity);
    }
    OrderTotalAmountEle.innerText = currentOrder.total + "₺";
}

async function renderProductsByCategoryById(id) {
    const products = await getAllByCategoryById(id);
    ProductsEle.innerHTML = "";
    for (const p of products) {
        ProductsEle.insertAdjacentHTML("beforeend", `
            <div class="product" id="${p.id}">
                <span class="name">${p.name}</span>
                <span class="price">${p.price}₺</span>
                <div class="controls">
                    <button id="increase-item-${p.id}"><img src="imgs/25304.png" alt=""></button>
                    <span id="quantity-item-${p.id}" class="count">1</span>
                    <button id="decrease-item-${p.id}"><img src="imgs/images.png" alt=""></button>        
                </div>
                <button id="send-item-${p.id}" class="send"><img src="imgs/350.png" alt=""></button>
            </div>       
        `);

        document.getElementById(`increase-item-${p.id}`).addEventListener("click", async () => {
            let count = document.getElementById(`quantity-item-${p.id}`).innerHTML;
            count++;
            document.getElementById(`quantity-item-${p.id}`).innerHTML = count;
        });

        document.getElementById(`decrease-item-${p.id}`).addEventListener("click", async () => {
            let count = document.getElementById(`quantity-item-${p.id}`).innerHTML;
            if (count != 1) {
                count--;
                document.getElementById(`quantity-item-${p.id}`).innerHTML = count;
            }
            return;
        });

        document.getElementById(`send-item-${p.id}`).addEventListener("click", async () => {
            let count = document.getElementById(`quantity-item-${p.id}`).innerHTML;
            await addOrderItem(p.name, p.price, count);
            renderProductsByCategoryById(id);
        });

    }
}

async function renderTables() {
    const tables = await getAllTables();
    TablesEle.innerHTML = "";
    for (const t of tables) {
        TablesEle.insertAdjacentHTML("beforeend", `
            <div id="table-${t.id}" class="table ${t.status}">
                <button id="button-${t.id}"> <img src="imgs/table.png" alt="">${t.number}</button>       
            </div>
        `);

        document.getElementById(`button-${t.id}`).addEventListener("click", async () => {
            currentTable = await getTableById(t.id);

            if (currentTable.status != "Empty") {
                await renderTableBox(currentTable);
            }
            else {
                TableNumberEle.innerText = currentTable.number;
            }
        });
    }
}

async function renderTableBox(table) {

    currentTable = table;
    TableBox.innerHTML = "";
    TableBox.classList.remove("hidden");
    TableBox.insertAdjacentHTML("beforeend", `
        <div class="closeBtn"><button id="closeBtn">x</button></div>
        <div class="table ${table.status}"> <img src="imgs/table.png"alt="">${table.number}</div>    
    `);

    const orders = await GetTableUnpaidOrdersByTableNumber(table.number);
    console.log(orders);
    let totalAmount = 0;
    for (const order of orders) {
        totalAmount += order.total;
        TableBox.insertAdjacentHTML("beforeend", `
            <div class="order">
                <span class="orderId">ID: ${order.id}</span>
                <div id="orderItems-${order.id}" class="orderItems"></div>
                <div class="total">Amount: ${order.total}₺</div>
            </div>
        `);

        const Items = await GetAllOrderItemsByOrderId(order.id);
        for (const Itme of Items) {
            document.getElementById(`orderItems-${order.id}`).insertAdjacentHTML("beforeend", `
                <div class="item">
                    <span>${Itme.quantity}</span>
                    <span>${Itme.name}</span>
                    <p>${Itme.description}</p>
                </div>
            `);
        }
    }

    document.getElementById("closeBtn").addEventListener("click", () => {
        currentTable = null;
        currentOrder = null;
        OrderIdEle.innerHTML = "???";
        TableNumberEle.innerHTML = "???";
        TableBox.classList.add("hidden");
    });

    if (table.status == "Processed") {
        TableBox.insertAdjacentHTML("beforeend", `
            <div class="controls">
                <button id="addExtra"><img src="imgs/992651.png" alt=""></button>
            </div>  
        `);

        document.getElementById("addExtra").addEventListener("click", () => {
            TableNumberEle.innerText = currentTable.number;
            TableBox.innerHTML = "";
            TableBox.classList.add("hidden");
        });
    }

    if (table.status == "Processing") {
        TableBox.insertAdjacentHTML("beforeend", `
            <div class="controls">
                <button id="processed"><img src="imgs/18442.png" alt=""></button>
                <button id="addExtra"><img src="imgs/992651.png" alt=""></button>
            </div>  
        `);

        document.getElementById("processed").addEventListener("click", async () => {
            await UpdateTable(currentTable.id, currentTable.number, currentTable.isAvailable, "Processed");
            location.reload();
        });

        document.getElementById("addExtra").addEventListener("click", () => {
            TableNumberEle.innerText = currentTable.number;
            TableBox.innerHTML = "";
            TableBox.classList.add("hidden");
        });
    }

    TableBox.insertAdjacentHTML("beforeend", `
        <div class="totalAmount">Total Amount: ${totalAmount}₺</div>  
    `);
}

CanselOrderEle.addEventListener("click", async () => {
    if (currentOrder == null || OrderItemsEle.innerHTML == "")
        return alert("ℹ️ No order to cansel");
    try {
        let answer = confirm("ℹ️ Do you want to remove all order items?");
        if (answer) {
            const result = await RemoveAllItems(order.id);
            currentOrder.total = 0;
            OrderTotalAmountEle.innerText = currentOrder.total + "₺";
            OrderItemsEle.innerHTML = "";
            TableNumberEle.innerText = "???";
            currentTable = null;
            alert("✅ " + result);
        }
        else
            return;
    }
    catch (err) {
        alert("⚠️ " + err.message);
    }
});

SendOrderEle.addEventListener("click", async () => {
    if (currentOrder == null || OrderItemsEle.innerHTML == "")
        return alert("ℹ️ No order to sand");

    try {
        let answer = confirm("ℹ️ Do you want to continue sending the order?");
        if (answer) {
            await UpdateOrder(currentOrder.id, currentOrder.status, currentOrder.payment, currentOrder.orderedName, currentOrder.total, currentTable.number, currentOrder.createdAt);
            await UpdateTable(currentTable.id, currentTable.number, currentTable.isAvailable, "Processing");
            alert("✅ Order Sended successfully!");
            currentTable = null;
            currentOrder = null;
            location.reload();
        }
        else
            return;
    }
    catch (err) {
        alert("⚠️ " + err.message);
    }
});

Logout.addEventListener("click", () => {
    location.href = "./login.html";
});
