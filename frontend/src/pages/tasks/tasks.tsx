import React, { useState } from "react";
import 'react-virtualized/styles.css';
import { InfiniteLoader, List, AutoSizer } from "../../utils/virtualize";
import { ListRowProps, ListRowRenderer } from "react-virtualized";
import { Container,  Dropdown, Navbar, Form, Button, DropdownButton } from "react-bootstrap";
import { filterStateType, TaskEntryType, useGitHub } from "../../utils/github";



function TasksPage(){
    return <>
        <NavigateBar/>
        <TaskList/>
    </>
}

export default TasksPage;

type NavigateBarPropsType = {
    
}
function NavigateBar(props : NavigateBarPropsType){
    const [filterState, setFilterState] = useState(filterStateType.all);
    return <>
        <Container>
            <Navbar bg="dark" fixed="top" className="p-2">
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
        </Container>
    </>;
}

type TaskListPropsType = {
    
}

function TaskList(props : TaskListPropsType) {
    const githubClient = useGitHub();

    const hasNextPage : boolean                 = githubClient.TotalPageCount > githubClient.PageCount;

    const [isLoadNextPage , setIsLoadNextPage] = useState(false);
    const loadNextPage : () => Promise<boolean> = async () => {
        setIsLoadNextPage(true);
        await githubClient.QueryTask(githubClient.QueryProp,githubClient.PageCount+1);
        setIsLoadNextPage(false);
        return true;
    };
    const render : ListRowRenderer              = (props: ListRowProps) => {
        const { title, body, state} = githubClient.GetTask(props.index);

        return props.isVisible && <>
            <span> Title : {title}</span>
            <span> Body : {body}</span>
            <span> State : {state}</span>
        </>
    };
    


    return (
      <InfiniteLoader
        isRowLoaded={({index}) => index < githubClient.CountTask || hasNextPage }
        loadMoreRows={isLoadNextPage ? () => new Promise((res,rej)=>res("noop")) : loadNextPage}
        rowCount={githubClient.CountTask}>
        {({onRowsRendered, registerChild}) => (
            <AutoSizer>
                {({height,width}) => <List
                    ref={registerChild}
                    onRowsRendered={onRowsRendered}
                    rowRenderer={render} height={height} rowHeight={100} rowCount={0} width={width}          
                />}
            </AutoSizer>
            
        )}
      </InfiniteLoader>
    );
  }