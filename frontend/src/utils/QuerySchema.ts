export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "All",
    error = "Error",
    loaded = "Loaded",
}

export enum QueryState {
    All = "all",
    Open = "open",
    InProcess = "inprocess",
    Done = "done",
}
export enum QueryOrder {
    OlderFirst = "asc",
    NewerFirst = "desc"
}

export type QuerySchema = {
    state?      : QueryState
    contain?    : string,
    order?      : QueryOrder,
}

export const defaultQueryProps : QuerySchema = {
    state       : QueryState.All,
    contain     : "",
    order       : QueryOrder.NewerFirst
};