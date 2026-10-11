import AdminOrders from "@/components/admin-orders"

export const metadata = {
  title: "Fulfilment | Doom Studio",
  description:
    "Admin view of every order: what to ship, which buyer, and the delivery address.",
}

export default function Page() {
  return <AdminOrders />
}