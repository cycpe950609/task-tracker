import React, { useState } from "react";
import 'react-virtualized/styles.css';
import { InfiniteLoader, List, AutoSizer } from "../../utils/virtualize";
import { ListRowProps, ListRowRenderer } from "react-virtualized";
import { Container,  Dropdown, Navbar, Form, Button, DropdownButton } from "react-bootstrap";

enum filterStateType  {
    open = "Open",
    inprocess = "In-Process",
    done = "Done",
    all = "all"

}

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
type TaskEntryType = {
    title : string,
    body : string,
    state : filterStateType,
}
function TaskList(props : TaskListPropsType) {
    const hasNextPage : boolean                 = false;
    const loadNextPage : () => Promise<boolean> = () => new Promise((res,rej)=>res(true));
    const isLoadNextPage : boolean              = false;
    const [list, setList]                       = useState([] as TaskEntryType[]);
    const render : ListRowRenderer              = (props: ListRowProps) => <></>;
    return (
      <InfiniteLoader
        isRowLoaded={({index}) => index < list.length || hasNextPage}
        loadMoreRows={isLoadNextPage ? () => new Promise((res,rej)=>res("noop")) : loadNextPage}
        rowCount={hasNextPage ? list.length + 1 : list.length}>
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