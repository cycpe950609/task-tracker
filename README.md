# Task Tracker
## 如何啟動專案

1. 將`frontend`和`backend`資料夾下的`example.env`命名成`.env`並填入相關的環境變數

    * `frontend/.env`

    |               變數                |               說明                 |
    | --------------------------------- | --------------------------------- |
    | REACT_APP_GITHUB_CLIENT_ID        | 註冊一個app時GitHub提供的 Client ID |
    | REACT_APP_GITHUB_CLIENT_SECRET    | 註冊一個app時GitHub提供的 Secret |
    | REACT_APP_BACKEND_URL             | 後端的網址，如http://localhost |
    | REACT_APP_BACKEND_PORT            | 後端監聽的port，如5000 |
    | PORT                              | 預設react-script start的Port |

    * `backend/.env`

    |               變數                |               說明                 |
    | --------------------------------- | --------------------------------- |
    | GITHUB_CLIENT_ID                  | 註冊一個app時GitHub提供的 Client ID |
    | GITHUB_CLIENT_SECRET              | 註冊一個app時GitHub提供的 Secret |
    | BACKEND_URL                       | 後端的網址，如http://localhost |
    | BACKEND_PORT                      | 後端監聽的port，如5000 |
    | FRONTEND_URL                      | 前端的網址，如http://localhost|
    | FRONTEND_PORT                     | 前端的port，如3000，需與PORT相同 |
    | ISSUE_TRACKER_USERNAME            | 作為Task Tracker管理issue的repo的所有者名稱 |
    | ISSUE_TRACKER_REPO_NAME           | 作為Task Tracker管理issue的repo名稱 |

2. 在專案跟目錄執行

    *  `yarn run serve:frontend`
    *  `yarn run build:backend`
    *  `yarn run serve:backend`

3. 打開網址 `FRONTEND_URL:FRONTEND_PORT`

## 專案設計

專案分成網頁和處理Task數據的後端

### Frontend
顯示Task資料並提供新增、編輯、刪除等功能，整個Task Tracker分成3個頁面(Page)，登入、取得讀取GitHub資料授權碼及編輯TaskList的頁面。TaskList則是由一個Context統一管理並向Backend取得、編輯、新建及刪除Task

### Backend
處理Frontend的操作後使用GitHub提供之API統一操作指定的repo的issues

* `/api/auth` : 取得存取GitHub API的Token 
* `/api/task` : 取得、編輯、新建及刪除Tasks