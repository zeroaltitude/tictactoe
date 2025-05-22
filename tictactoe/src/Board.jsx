import _ from "lodash";
import {useState} from "react";

export default function Board(props) {
    const rows=[0,1,2];
    const columns=[0,1,2];
    const [currentRoute, setCurrentRoute] = useState(props.treeNode.getFullRoute([props.row,props.column]));
    return (
        <div id={"board-" + props.depth + "-" + props.row + "-" + props.column} style={{
            padding: `${(props.depth+1)*25}px`,
            border: _.isEqual(props.activeBoard,currentRoute.slice(0,currentRoute.length-2*(props.winDepth+1)))? "1px solid green":"",
            backgroundColor: _.isEqual(props.activeBoard,currentRoute.slice(0,currentRoute.length-2*(props.winDepth+1)))? "green":"#ddd"
        }}>
            <table>
                {rows.map((row)=>(
                    <tr>
                        {columns.map((column)=>(
                            <td id={"cell-" + "-" + props.depth + "-" + props.row + "-" + props.column + "-" + row + "-" + column} style={{
                                borderBottom: row<2? `${props.depth*3+1}px solid black`:'',
                                borderLeft: column>0? `${props.depth*3+1}px solid black`:''
                             }}>
                                {props.depth>1 && (
                                    <Board depth={props.depth-1} row={row} column={column} handleMove={props.handleMove} treeNode={props.treeNode.children[row][column]} activeBoard={props.activeBoard} winDepth={props.winDepth} />
                                )}
                                {props.depth===1 && (
                                    <button onClick={(event) => {
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
            </table>
        </div>
    );
}