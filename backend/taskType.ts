export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "All",
    error = "Error",
    loaded = "Loaded",
    deleted = "Deleted",
}
export type TaskEntryType = {
    index : number,
    title : string,
    body : string,
    state : filterStateType,
}