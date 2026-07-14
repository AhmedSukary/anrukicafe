import { get, post, put, del } from "../core/apiClient.js";

export async function GetTableUnpaidOrdersByTableNumber(tableNumber) {
    return await get("/Order/GetTableUnpaidOrders/" + tableNumber);
}

export async function GetAllOrderItemsByOrderId(orderId) {
    return await get("/Order/GetAllOrderItemsBy/" + orderId);
}

export async function AddNewOrder(orderedName, tableNumber) {
    const result = await post("/Order/AddNewOrder", {
        orderedName,
        tableNumber,
    });
    return result;
}

export async function AddOrderItem(orderId, name, description, price, quantity) {
    const result = await post("/Order/AddOrderItem", {
        orderId,
        name,
        description,
        price,
        quantity,
    });
    return result;
}

export async function UpdateOrder(id, status, payment, orderedName, total, tableNumber, createdAt) {
    const result = await put("/Order/EditOrder", {
        id,
        status,
        payment,
        orderedName,
        total,
        tableNumber,
        createdAt,
    });
    return result;
}

export async function UpdateItem(id, orderId, name, description, price, quantity) {
    const result = await put("/Order/EditOrderItem", {
        id,
        orderId,
        name,
        description,
        price,
        quantity,
    });
    return result;
}

export async function RemoveItem(id) {
    return await del("/Order/DeleteOrderItemBy/" + id);
}

export async function RemoveAllItems(orderId) {
    return await del("/Order/DeleteOrderItemsBy/" + orderId);
}