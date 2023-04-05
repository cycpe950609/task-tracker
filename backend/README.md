# Backend API
* `/api/auth` : 取得存取GitHub API的Token 

    * `/getToken`: 
    ```typescript
    {
        code        : string
    }
    ```

* `/api/task` : 取得、編輯、新建及刪除Tasks

    * `/select` : 
    ```typescript
    {
        token       : string,
        state?      : 'all'|'open'|'inprocess'|'done',
        contain?    : string,
        pagesize?   : number,
        page        : number,
        order?      : 'desc'|'asc'
    }
    ```
    * `/create` : 
    ```typescript
    {
        token       : string,
        title       : string,
        state       : 'open'|'inprocess'|'done',
        body        : string
    }
    ```
    * `/update` : 
    ```typescript
    {
        token       : string,
        id          : number,
        title?      : string,
        state?      : 'open'|'inprocess'|'done',
        body?       : string
    }
    ```
    * `/delete` :
    ```typescript
    {
        token       : string,
        id          : number
    }
    ```