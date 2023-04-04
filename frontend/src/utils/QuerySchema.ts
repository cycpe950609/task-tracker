export enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "All",
    error = "Error",
    loaded = "Loaded",
    deleted = "Deleted",
}

export enum QueryState {
    All = "all",
    Open = "open",
    InProcess = "inprocess",
    Done = "done",
    Deleted = "deleted"
}
export enum QueryOrderBy {
    Title = "title",
    CreateTime = "createtime",
    Body = "body",
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