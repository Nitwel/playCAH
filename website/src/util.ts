import { useStore } from "./store";

export function useUtil() {
    const store = useStore()

    function isAllPlaced() {
        const users = store.state.users.filter((u) => u.connected);
        return (
            Object.values(users.filter((u) => u.placed)).length === users.length - 1
        );
    }
    function isAllRevealed() {
        const users = store.state.users.filter((u) => u.connected);
        return Object.values(store.state.revealed).length === users.length - 1;
    }
    function getConnectedUsers() {
        return store.state.users.filter((u) => u.connected);
    }
    function getDisconnectedUsers() {
        return store.state.users.filter((u) => !u.connected);
    }
    
    return {isAllPlaced, isAllRevealed, getConnectedUsers, getDisconnectedUsers}
}