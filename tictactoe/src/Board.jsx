export default function Board(props) {
    const rows=[0,1,2];
    const columns=[0,1,2];
    return (
        <div id={"board-" + props.depth + "-" + props.row + "-" + props.column} style={{
            padding: `${(props.depth+1)*25}px`,
            backgroundColor: "#ddd"
        }}>
            <table>
                {rows.map((row)=>(
                    <tr>
                        {columns.map((column)=>(
                            <td id={"cell-" + "-" + props.depth + "-" + props.row + "-" + props.column + "-" + row + "-" + column} style={{
                                borderBottom: row<2? `${props.depth*3+1}px solid black`:'',
                                borderLeft: column>0? `${props.depth*3+1}px solid black`:''
                             }}>
                                {props.depth>0 && (
                                    <Board depth={props.depth-1} row={row} column={column} />
                                )}
                                {props.depth===0 && (
                                    <button onClick={(event) => {
                                            event.target.innerHTML = "X"
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