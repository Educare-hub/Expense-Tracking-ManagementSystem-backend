// /src/utils/api.js

const AZURE_BACKEND_URL = "https://my-expense-pro-cranfjb0hshufgee.canadacentral-01.azurewebsites.net";

async function fetchFromAzure(endpoint, options = {}) {
  try {
    const res = await fetch(`${AZURE_BACKEND_URL}/api/${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Azure backend error ${res.status}: ${text}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Frontend fetch error:", error);
    return null;
  }
}


export async function getUsers() {
  return await fetchFromAzure("users");
}

export async function getExpenses() {
  return await fetchFromAzure("expenses");
}

export async function createUser(userData) {
  return await fetchFromAzure("users", { method: "POST", body: JSON.stringify(userData) });
}

export async function createExpense(expenseData) {
  return await fetchFromAzure("expenses", { method: "POST", body: JSON.stringify(expenseData) });
}
export async function updateExpense(expenseId, updateData) {
  return await fetchFromAzure(`expenses/${expenseId}`, { method: "PUT", body: JSON.stringify(updateData) });
}