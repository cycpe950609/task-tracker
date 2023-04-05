import React, { FormEvent, useState } from "react";
import 'react-virtualized/styles.css';
import { InfiniteLoader, List, AutoSizer } from "../../utils/virtualize";
import { IndexRange, ListRowProps, ListRowRenderer } from "react-virtualized";
import { Container,  Dropdown, Navbar, Form, Button, DropdownButton, Modal, Alert, Badge, Stack, ToggleButton } from "react-bootstrap";
import { useGitHub } from "../../utils/github";
import { parseJsonConfigFileContent } from "typescript";
import { TaskEntryType } from "@my-issue-tracker/backend/taskType";
import {filterStateType, QueryOrder, QueryState} from "../../utils/QuerySchema";
import { useNavigate } from "react-router-dom";

type ModalPropsType = {
    id : number,
    close : () => void,
}

type DeletingModalPropsType = ModalPropsType
                            & {issueNum : number}

function DeletingModal(props:DeletingModalPropsType) {
    const githubClient = useGitHub();
    return <>
        <Modal show onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>Deleting</Modal.Title>
            </Modal.Header>
                <Modal.Body>Do you want to delete Task #{props.issueNum}</Modal.Body>
                <Modal.Footer>
                <Button variant="success" onClick={props.close}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={()=>{ githubClient.DeleteTask(props.id); props.close(); }}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

function variantOfState(state : filterStateType) {
    switch(state){
        case filterStateType.open       : return "primary";
        case filterStateType.inprocess  : return "warning";
        case filterStateType.done       : return "success";
        case filterStateType.error      : return "danger";
        default                         : return "primary";
    }
}

type EditingModalPropsType = ModalPropsType 
                            & {task : TaskEntryType} 
                            & {update : (newValue : TaskEntryType) => void};

function EditingModal(props:EditingModalPropsType) {
    const [newTitle,setNewTitle]    = useState(props.task.title);
    const [newBody,setNewBody]      = useState(props.task.body);
    const [newState,setNewState]    = useState(props.task.state);

    const [showAlert,setShowAlert] = useState(false);
    const [alertText,setAlertText] = useState("");

    const updateTask = () => {
        if(newTitle.length === 0){
            setAlertText("Title is required.");
            setShowAlert(true);
            return;
        }
        if(newBody.split(/\s+/).length < 30){
            setAlertText("Content too short. Must longer than 30 words.");
            setShowAlert(true);
            return;
        }
        const newValue : TaskEntryType = {
            index   : props.task.index,
            title   : newTitle,
            body    : newBody,
            state   : newState
        }
        props.update(newValue);
        props.close();
    }
    return <>
        
        <Modal show onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Task #{props.id}</Modal.Title>
            </Modal.Header>
                <Modal.Body>
                    <div className="d-flex flex-column">
                        {showAlert && <Alert variant="danger">{alertText}</Alert>}
                        <div className="d-flex flex-row">
                            <Form.Control value={newTitle} onChange={(e) => {setNewTitle(e.target.value)} }></Form.Control>
                            <DropdownButton title={newState} variant={variantOfState(newState)} className="ms-2">
                                <Dropdown.Menu >
                                    <Dropdown.Item 
                                        onClick={() => setNewState(filterStateType.open)} 
                                        active={newState === filterStateType.open}>
                                            Open
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                        onClick={() => setNewState(filterStateType.inprocess)} 
                                        active={newState === filterStateType.inprocess}>
                                            In-Process
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                        onClick={() => setNewState(filterStateType.done)} 
                                        active={newState === filterStateType.done}>
                                            Done
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </DropdownButton>
                        </div>
                        <Form.Control as="textarea" value={newBody} onChange={(e) => {setNewBody(e.target.value)}} className="mt-2"/>
                    </div>
                        
                </Modal.Body>
                <Modal.Footer>
                <Button variant="primary" onClick={props.close}>
                    Cancel
                </Button>
                <Button variant="success" onClick={()=> updateTask()}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

function TasksPage(){
    return <>
    <div className="d-flex flex-column h-100">
        <NavigateBar/>
        <TaskList/>
    </div>
        
    </>
}

export default TasksPage;

type NavigateBarPropsType = {
    
}

function NavigateBar(props : NavigateBarPropsType){
    const githubClient = useGitHub();

    const [filterState, setFilterState] = useState(filterStateType.all);
    
    const [showModal,setShowModal] = useState(false);
    const [containText,setContainText] = useState("");

    const [IsAsc,setIsAsc] = useState(false);// Newer first

    const updateFilterState = (state:filterStateType) => {
        setFilterState(state);
        updateQuery(state,IsAsc)
    }

    const updateQuery = (state : filterStateType,orderIsDesc : boolean) => { 
        const newQuery = {...githubClient.QueryProp};
        switch(state){
            case filterStateType.all        : { newQuery.state = QueryState.All; break; }
            case filterStateType.open       : { newQuery.state = QueryState.Open; break; }
            case filterStateType.inprocess  : { newQuery.state = QueryState.InProcess; break; }
            case filterStateType.done       : { newQuery.state = QueryState.Done; break; }
            default                         : { newQuery.state = QueryState.All; break; }
        }
        newQuery.contain = containText;
        newQuery.order = orderIsDesc ? QueryOrder.NewerFirst : QueryOrder.OlderFirst;
        githubClient.SetQueryProp(newQuery)
    }
    const searchSubmit = (e : FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        updateQuery(filterState,!IsAsc);
    };

    const updateOrder = (isAsc: boolean) => {
        setIsAsc(isAsc);
        updateQuery(filterState,!isAsc);
    }

    const templateTask : TaskEntryType = {
        index : 0,
        title : "New Task",
        body : "What do you want to do ?",
        state : filterStateType.open
    }
    // TODO : Get total task count
    return <>
        {showModal && <EditingModal id={0} close={() => setShowModal(false)} task={templateTask} update={(newValue) => githubClient.CreateTask(newValue)} />}
        <Navbar bg="dark" className="p-2 nav-fill w-100" >
            <DropdownButton title={filterState} className="m-1">
                <Dropdown.Menu>
                    <Dropdown.Item 
                        onClick={() => updateFilterState(filterStateType.all)} 
                        active={filterState === filterStateType.all}>
                            All
                    </Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item 
                        onClick={() => updateFilterState(filterStateType.open)} 
                        active={filterState === filterStateType.open}>
                            Open
                    </Dropdown.Item>
                    <Dropdown.Item 
                        onClick={() => updateFilterState(filterStateType.inprocess)} 
                        active={filterState === filterStateType.inprocess}>
                            In-Process
                    </Dropdown.Item>
                    <Dropdown.Item 
                        onClick={() => updateFilterState(filterStateType.done)} 
                        active={filterState === filterStateType.done}>
                            Done
                    </Dropdown.Item>
                </Dropdown.Menu>
            </DropdownButton>
            <Form className="d-flex flex-grow-1" onSubmit={searchSubmit}>
                <Form.Control
                type="search"
                placeholder="Search in content of task"
                className="mx-1"
                aria-label="Search"
                value={containText}
                onChange={(e) => setContainText(e.target.value)}
                />
                <Button className="mx-1" type="submit">Search</Button>
            </Form>
            <ToggleButton
                className="m-1"
                id="toggle-check"
                type="checkbox"
                variant="primary"
                checked={IsAsc}
                value="1"
                onChange={(e) => updateOrder(e.currentTarget.checked)}
            >
                {IsAsc ? "Newer first" : "Older first" }
            </ToggleButton>
            <Button className="m-1" onClick={() => setShowModal(true)}>Create</Button>
        </Navbar>
    </>;
}

type TaskListPropsType = {
    
}
function TaskList(props : TaskListPropsType) {

    const githubClient = useGitHub();

    // console.log("Rerender TaskList")
    const navigate = useNavigate();

    const hasNextPage = () => { console.log("githubClient.PageCount",githubClient.PageCount); return githubClient.TotalPageCount > githubClient.PageCount};

    const [isLoadNextPage , setIsLoadNextPage] = useState(false);
    const loadNextPage : (params : IndexRange) => Promise<boolean> = async (params: IndexRange) => {
        console.log("loadNextPage",params.startIndex,params.stopIndex)
        setIsLoadNextPage(true);
        try {
            await githubClient.QueryTask(githubClient.PageCount);
        } catch (error) {
            console.log(error)
            navigate("/")
        }
        setIsLoadNextPage(false);
        return true;
    };

    const [showModal,setShowModal] = useState(false);
    const [modalType,setModalType] = useState("");
    const [editingID,setEditingID] = useState(-1);// Edit / Delete 
    const render : ListRowRenderer = (props: ListRowProps) => {

        const TITLE_SHOW_MAX_LENGTH = 100;
        const BODY_SHOW_MAX_LENGTH = 60;

        const styles = props.style;
        const key = props.key;
    
        let content;
    

        const { index, title, body, state} = githubClient.GetTask(props.index);
        const showTitleText = title.length > TITLE_SHOW_MAX_LENGTH ? title.slice(0,TITLE_SHOW_MAX_LENGTH - 3) + "..." : title;
        const showBodyText = body.length > BODY_SHOW_MAX_LENGTH ? body.slice(0,BODY_SHOW_MAX_LENGTH - 3) + "..." : body;
        const isLoaded = (state as filterStateType != filterStateType.loaded) && (state as filterStateType != filterStateType.error)

        const StateViewer = (props : { state : filterStateType}) => {
            switch(props.state){
                case filterStateType.open       : return <Badge bg="primary">Open</Badge>;
                case filterStateType.inprocess  : return <Badge bg="warning">In-Process</Badge>;
                case filterStateType.done       : return <Badge bg="success">Done</Badge>;
                default: return <></>;
            }
        }

        const btnDeleteClick = (deleteId:number) => {
            console.log(`Delete ${index}`);
            setModalType("deleting");
            setEditingID(deleteId);
            setShowModal(true);
        }

        const btnEditClick = (editId:number) => {
            console.log(`Edit ${editId}`);
            setModalType("editing");
            setEditingID(editId);
            setShowModal(true);
        }

        if(isLoaded)
            content = props.isVisible  && <>
                <Stack direction="horizontal" >
                    <span className="align-items-center badge bg-secondary">#{index}</span>
                    <Stack>
                        <strong className="ms-2">{showTitleText}</strong>
                        <small className="ms-2" >{showBodyText}</small>
                    </Stack>
                    <div className="ms-auto"></div>
                    <StateViewer state={state}/>
                    <Button type="button" variant="success" className="ms-2" onClick={() => btnEditClick(props.index)}>Edit</Button>
                    <Button type="button" variant="danger" className="m-2" onClick={() => btnDeleteClick(props.index)}>Delete</Button>
                    
                </Stack>
                
            </>
        else
            content = "Loading";

        return (
          <div key={key} style={{...styles,padding:"2px"}}>
                {content}
          </div>
        );
    };        
    const closeModal = () => {
        setShowModal(false);
        setModalType("");
        setEditingID(-1);  
    }

    console.log(`TaskCount : ${githubClient.TaskCount}`)

    return (
        <div className="p-2 w-100 h-100" style={{flex: "1 1 auto"}}>
            <InfiniteLoader
                isRowLoaded={({index}) => {
                    // console.log(`isRowLoaded ${index}`)
                    const {state} = githubClient.GetTask(index);
                    const isLoaded = (state as filterStateType != filterStateType.loaded) && (state as filterStateType != filterStateType.error)
                    console.log(`isRowLoaded ${index} : ${isLoaded}`)
                    return isLoaded;
                } }
                loadMoreRows={
                isLoadNextPage ? () =>{
                    console.log("isLoadNextPage");
                    return new Promise((res,rej)=>res("noop")) 
                }: 
                loadNextPage}
                rowCount={githubClient.TaskCount}
                minimumBatchSize={10}
            >
                {({onRowsRendered, registerChild}) => (
                    // <div style={{flex: "1 1 auto"}}>
                        <AutoSizer>
                            {({height,width}) => (
                                <List
                                ref={registerChild}
                                onRowsRendered={onRowsRendered}
                                rowRenderer={render} rowHeight={60} height={height} rowCount={githubClient.TaskCount} width={width}          
                                noRowsRenderer={() =><div className="text-center d-flex flex-column justify-content-center h-100"><span>The List is empty.</span></div> }
                                />)
                            }
                        </AutoSizer>
                    // </div>
                )}
            </InfiniteLoader>
            {(modalType === "deleting") && <DeletingModal id={editingID} issueNum={githubClient.GetTask(editingID).index} close={closeModal}></DeletingModal>}
            {(modalType === "editing") && <EditingModal  id={editingID} close={closeModal} task={githubClient.GetTask(editingID)} update={(newValue)=> githubClient.SetTask(editingID,newValue)}></EditingModal>}
        </div>
    );
}