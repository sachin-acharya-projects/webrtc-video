import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormHTMLAttributes } from "react"

type Props = FormHTMLAttributes<HTMLFormElement>
export function RoomForm({ ...rest }: Props) {
    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Join Room</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form {...rest} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="m@example.com"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="room">Room ID</Label>
                        <Input
                            id="room"
                            name="room"
                            type="text"
                            autoComplete="off"
                            placeholder="room-code-xxxx-xxxx"
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create / Join
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
