import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"

import Home from "./pages/Home"
import Room from "./pages/Room"
import SocketProvider from "./providers/socket-provider"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/room/:id",
        element: <Room />,
    },
])
export default function App() {
    return (
        <SocketProvider>
            <Toaster />
            <RouterProvider router={router} />
        </SocketProvider>
    )
}
