import { debugLog } from "./App";
import { toast } from "react-toastify";

export default function Board(props) {
    const rows = [0, 1, 2];
    const columns = [0, 1, 2];
    const boardActiveFlag = props.treeNode.activeCheck(props.previousMove) && props.depth === 1;
    const notify = (message) => toast(message);

    return (
        <div id={"board-" + props.depth + "-" + props.row + "-" + props.column} style={{
            padding: `${(props.depth+1)*25}px`,
            border: boardActiveFlag ? "1px solid green" : "",
            backgroundColor: boardActiveFlag ? "green" : "#ddd",
        }}>
            <table>
                <tbody>
                {rows.map((row)=>(
                    <tr key={`row-${props.depth}-${props.row}-${props.column}-${row}`}>
                        {columns.map((column)=>(
                            <td key={`cell-${props.depth}-${props.row}-${props.column}-${row}-${column}`} style={{
                                borderBottom: row<2? `${props.depth*3+1}px solid black`:'',
                                borderLeft: column>0? `${props.depth*3+1}px solid black`:''
                             }}>
                                {props.depth>1 && (
                                    <Board depth={props.depth-1}
                                           row={row} column={column}
                                           handleMove={props.handleMove}
                                           treeNode={props.treeNode.children[row][column]}
                                           winDepth={props.winDepth}
                                           previousMove={props.previousMove}
                                           dimension={props.dimension} />
                                )}
                                {props.depth===1 && (
                                    <button
                                        id={`cell-${props.treeNode.getFullRoute([row,column]).join('-')}`}
                                        onClick={(event) => {
                                            if (!boardActiveFlag) {
                                                notify(`brotjer look at the previous move, do you even know the rulse: [${event.target.id}]`);
                                                return;
                                            }
                                            debugLog("MOVE_CLICK", event.target.id);
                                            debugLog("MOVE_RECORDER", props.treeNode.getFullRoute([row,column]) );
                                            props.handleMove(event,props.treeNode,row,column)
                                        }
                                    }
                                    style={{
                                        width: "45px",
                                        height: "45px",
                                        border: 0,
                                        margin: "2px",
                                        fontSize: "30px"
                                    }}>
                                    </button>
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
