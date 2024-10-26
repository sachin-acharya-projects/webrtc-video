import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"

import SocketProvider from "./providers/socket-provider"
import PeerProvider from "./providers/peer-provider"
// import Room from "./pages/Room"
// import Home from "./pages/Home"
import MyRoom from "./pages/MyRoom"
import LobbyScreen from "./pages/Lobby"

const router = createBrowserRouter([
    {
        path: "/",
        element: <LobbyScreen />,
    },
    {
        path: "/room/:id",
        element: <MyRoom />,
    },
])
export default function App() {
    return (
        <SocketProvider>
            <PeerProvider>
                <Toaster />
                <RouterProvider router={router} />
            </PeerProvider>
        </SocketProvider>
    )
}
