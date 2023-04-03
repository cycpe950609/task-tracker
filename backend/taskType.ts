import {filterStateType} from "@my-issue-tracker/frontend/src/utils/QuerySchema"

export type TaskEntryType = {
    index : number,
    title : string,
    body : string,
    state : filterStateType,
}