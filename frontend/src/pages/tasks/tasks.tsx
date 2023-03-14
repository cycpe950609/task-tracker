import React, { useState } from "react";
import 'react-virtualized/styles.css';
import { InfiniteLoader, List, AutoSizer } from "../../utils/virtualize";
import { IndexRange, ListRowProps, ListRowRenderer } from "react-virtualized";
import { Container,  Dropdown, Navbar, Form, Button, DropdownButton } from "react-bootstrap";
import { filterStateType, TaskEntryType, useGitHub } from "../../utils/github";
import { parseJsonConfigFileContent } from "typescript";



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
    const [filterState, setFilterState] = useState(filterStateType.all);
    return <>
        <Navbar bg="dark" className="p-2 nav-fill w-100" >
            <DropdownButton title={filterState}>
                <Dropdown.Menu>
                    <Dropdown.Item 
                        onClick={() => setFilterState(filterStateType.all)} 
                        active={filterState === filterStateType.all}>
                            All
                    </Dropdown.Item>
                    <Dropdown.Divider/>
                    <Dropdown.Item 
                        onClick={() => setFilterState(filterStateType.open)} 
                        active={filterState === filterStateType.open}>
                            Open
                    </Dropdown.Item>
                    <Dropdown.Item 
                        onClick={() => setFilterState(filterStateType.inprocess)} 
                        active={filterState === filterStateType.inprocess}>
                            In-Process
                    </Dropdown.Item>
                    <Dropdown.Item 
                        onClick={() => setFilterState(filterStateType.done)} 
                        active={filterState === filterStateType.done}>
                            Done
                    </Dropdown.Item>
                </Dropdown.Menu>
            </DropdownButton>
            <Form className="d-flex flex-grow-1 m-2">
                <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
                />
                <Button>Search</Button>
            </Form>
            <Button>Create</Button>
        </Navbar>
    </>;
}

type TaskListPropsType = {
    
}

function TaskList(props : TaskListPropsType) {
    const githubClient = useGitHub();

    const hasNextPage = () => { console.log("githubClient.PageCount",githubClient.PageCount); return githubClient.TotalPageCount > githubClient.PageCount};

    const [isLoadNextPage , setIsLoadNextPage] = useState(false);
    const loadNextPage : (params : IndexRange) => Promise<boolean> = async (params: IndexRange) => {
        console.log("loadNextPage",params.startIndex,params.stopIndex)
        setIsLoadNextPage(true);
        await githubClient.QueryTask(githubClient.QueryProp,githubClient.PageCount);
        setIsLoadNextPage(false);
        return true;
    };
    const render : ListRowRenderer = (props: ListRowProps) => {
        const styles = props.style;
        const index = props.index;
        const key = props.key;
    
        let content;
    

        const { title, body, state} = githubClient.GetTask(props.index);
        const isLoaded = (state as filterStateType != filterStateType.loaded) && (state as filterStateType != filterStateType.error)

        if(isLoaded)
            content = props.isVisible  && <>
                <span> Title : {title}</span>
                <span> Body : {body}</span>
                <span> State : {state}</span>
            </>
        else
            content = "Loading";

        return (
          <div key={key} style={{...styles,padding:"2px", border : "1px solid black"}}>
            {content}
          </div>
        );
    };

    return (
        <div className="p-2 w-100 h-100" style={{flex: "1 1 auto"}}>
            <InfiniteLoader
                isRowLoaded={({index}) => {
                    // console.log(`isRowLoaded ${index}`)
                    const {state} = githubClient.GetTask(index); 
                    const isLoaded = (state as filterStateType != filterStateType.loaded) && (state as filterStateType != filterStateType.error)
                    // console.log(`isRowLoaded ${index} : ${isLoaded}`)
                    return isLoaded;
                } }
                loadMoreRows={
                // isLoadNextPage ? () =>{
                //     console.log("isLoadNextPage");
                //     return new Promise((res,rej)=>res("noop")) 
                // }: 
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
                                    rowRenderer={render} height={height} rowHeight={50} rowCount={githubClient.TaskCount} width={width}          
                                />)
                            }
                        </AutoSizer>
                    // </div>
                )}
            </InfiniteLoader>
        </div>
    );
  }