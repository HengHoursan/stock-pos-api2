# 📦 POS + Stock (Inventory) System Logic Guide

This documentation provides a high-visibility overview of the backend logic, business rules, and data flows.

---

## 📑 Table of Contents
1. [Core Features & Logic](#-core-features--logic)
2. [Critical Business Rules](#-critical-business-rules)
3. [Main Process Flows](#-main-process-flows)
4. [Universal Technical Rules](#-universal-technical-rules)

---

## 🛠 Core Features & Logic

| Module | Simple Purpose | Stock Impact |
| :--- | :--- | :--- |
| `Product Detail` | Monitors life-cycle and balance. | 🔍 **Monitor** |
| `Transaction` | Historical audit trail. | 📝 **Audit Log** |
| `Purchase Invoice` | Stock replenishment (Bill). | 📈 **INCREASE (+)** |
| `Sale Invoice` | Commercial sale (Receipt). | 📉 **DECREASE (-)** |
| `Purchase Return` | Sending items back to vendor. | 📉 **DECREASE (-)** |
| `Sale Return` | Processing customer refunds. | 📈 **INCREASE (+)** |
| `Unit` | Bulk and Piece calculations. | 🔢 **Math Logic** |

---

### 🔍 Deep Dive: How the Logic Works

#### **1. Inventory Management** 🏷️
*   **`Product Detail`**: Linked 1:1 with each product. It stores the `current_stock`.
*   **`Transaction Log`**: Every time stock moves, we save:
    *   **Beginning Stock**: What you had before.
    *   **Quantity**: The change (+ or -).
    *   **After Stock**: The final balance.
    *   *Why?* This ensures 100% audit accuracy.

#### **2. Sales (POS) Logic** 🛒
*   **Trigger**: Finalizing a `Sale Invoice`.
*   **Action**: 
    1. System checks shelf availability.
    2. Subtracts quantity from **`Product Detail`**.
    3. Records the **Revenue** in the ledger.
    4. Logs the **"STOCK OUT"** transaction.

#### **3. Procurement (Stock-In) Logic** 🚛
*   **Trigger**: Finalizing a `Purchase Invoice`.
*   **Action**:
    1. System adds quantity to **`Product Detail`**.
    2. Creates a **Bill** payable to the Supplier.
    3. Logs the **"STOCK IN"** transaction.

---

## ⚖️ Critical Business Rules

> [!IMPORTANT]
> **Atomic Transactions**
> If a sale has 10 items and the 10th item fails to update stock, the **entire sale is cancelled**. We never allow "half-finished" data.

> [!WARNING]
> **Return Validation**
> You can **never** return more items than were originally purchased on the same invoice. Returns strictly require a **Valid Invoice Reference**.

> [!CAUTION]
> **Audit Integrity**
> Transactions **cannot be deleted or edited**. If an error was made, you must create a new "Adjustment Transaction" to maintain a perfect audit trail.

---

## 🔄 Main Process Flows

### 📦 The Stock-In Cycle
1.  **Quotation (`PQ`)**: Draft estimate (No stock change).
2.  **Order (`PO`)**: Commitment to buy (Tracks **"expected"** stock).
3.  **Invoice (`PI`)**: Items arrive. **Stock increases** and financial debt is recorded.

### 💵 The Sales (POS) Cycle
1.  **Quotation (`SQ`)**: Customer estimate (No stock change).
2.  **Order (`SO`)**: Reserved/Confirmed booking.
3.  **Invoice (`SI`)**: Counter checkout. **Stock decreases** and income is recorded.
4.  **Payment**: Settlement. Can be `Full`, `Partial`, or `Credit`.

---

## ⚙️ Universal Technical Rules
*   **References**: Every `Return` knows its `Invoice`. Every `Invoice` knows its `Order`.
*   **Multi-Payments**: One `Invoice` can have many `Payment` records (Installments).
*   **Snake_Case**: Database columns use `snake_case`, while code uses `camelCase`.
