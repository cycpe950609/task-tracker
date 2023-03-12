import { FC } from "react";
import {
    AutoSizer as _AutoSizer,
    List as _List,
    ListProps,
    AutoSizerProps,
    InfiniteLoader as _infiniteLoader,
    InfiniteLoaderProps
} from "react-virtualized";
  
export const List = _List as unknown as FC<ListProps>;
export const AutoSizer = _AutoSizer as unknown as FC<AutoSizerProps>;
export const InfiniteLoader = _infiniteLoader as unknown as FC<InfiniteLoaderProps>;