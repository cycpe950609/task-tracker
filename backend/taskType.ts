export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "All",
    error = "Error",
    loaded = "Loaded",
}
export type TaskEntryType = {
    title : string,
    body : string,
    state : filterStateType,
}