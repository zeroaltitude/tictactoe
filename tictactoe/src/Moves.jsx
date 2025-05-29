import {useCallback} from "react";

export function Premover(props) {
    const premove = useCallback((coordinates) => {
        // alert(`cell-${coordinates.join('-')}` + " " + document.getElementById(`cell-${coordinates.join('-')}`));
        let event = {
            target: document.getElementById(`cell-${coordinates.join('-')}`),
        };
        const poppedCoords = coordinates.slice(0, coordinates.length - 2);
        const treeNode = props.boardTree.getNodeByCoordRoute(poppedCoords);
        props.handleMove(event, treeNode, coordinates[0], coordinates[1]);
    }, [props]);

    const premove1=useCallback(() => {
        // we're going to fake out event and then find the right treemove by coordinate
        // must assume board size since this is NOT a generic debugging tool: depth = 3
        // here's the dillio: coordinates = [topx, topy, nextx, nexty, nextx, nexty, row, column]
        premove([ 0,0,0,0,2,2 ]);
        // premove([ 0,0,2,2,0,0 ]);
        // premove([ 0,0,0,0,1,1 ]);
        // premove([ 0,0,1,1,0,0 ]);
        // premove([ 0,0,0,0,0,0 ]);
        // premove([ 0,0,1,0,1,1 ]);
        // premove([ 0,0,1,1,0,1 ]);
        // premove([ 0,0,0,1,1,1 ]);
        // premove([ 0,0,1,1,0,2 ]);
        // premove([ 0,0,0,2,1,1 ]);
        // premove([ 0,0,1,1,1,2 ]);
        // premove([ 0,0,1,2,1,1 ]);
        // premove([ 0,0,1,1,2,2 ]);
        // premove([ 1,1,2,2,0,0 ]);
        // premove([ 1,1,0,0,0,0 ]);
        // premove([ 1,1,0,0,2,0 ]);
        // premove([ 1,1,2,0,2,0 ]);
        // premove([ 1,1,2,0,0,0 ]);
        // premove([ 1,1,0,0,0,1 ]);
        // premove([ 1,1,0,1,0,0 ]);
        // premove([ 1,1,0,0,0,2 ]);
        // premove([ 0,0,0,2,2,2 ]);
        // premove([ 0,0,2,2,2,0 ]);
        // premove([ 0,0,2,0,2,2 ]);
        // premove([ 0,0,2,2,2,1 ]);
        // premove([ 0,0,2,1,2,2 ]);
        // premove([ 0,0,2,2,2,2 ]);
        // premove([ 2,2,2,2,0,0 ]);
    }, [premove])

    return (
        <div style={{
            border:"5px solid #031433",
            paddingRight:"50px",
            backgroundColor:"#222222",
            fontFamily:"monospace"
        }}>
            <h2 style={{color:"white"}}>Premover</h2>
            <button onClick={premove1}>[1] Click this to make a bunch of useful moves, pronto</button>
        </div>
    )}

export default function Board(props) {
    const letters=['A','B','C']
    let scaledFontSize=(16/window.devicePixelRatio)+"px";
    document.documentElement.style["font-size"] = scaledFontSize;
    return (
        <div style={{
            border:"5px solid #031433",
            paddingRight:"50px",
            backgroundColor:"#222222",
            fontFamily:"monospace"
        }}>
            <ol>
                {props.moveList.map((move) =>
                <li style={{
                    color:"white"
                }}>{move.map((coord,index) =>
                    index%2===0?letters[coord]:coord+1
                    )}</li>
                )}
            </ol>
        </div>
    )
}

// App.jsx:13 [MOVE_RECORDER] 0,0,0,0,2,2
// App.jsx:13 [MOVE_RECORDER] 0,0,2,2,0,0
// App.jsx:13 [MOVE_RECORDER] 0,0,0,0,0,0
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,1,2
// App.jsx:13 [MOVE_RECORDER] 0,0,0,0,2,0
// App.jsx:13 [MOVE_RECORDER] 0,0,2,0,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,0,0
// App.jsx:13 [MOVE_RECORDER] 0,0,0,0,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,2,2
// App.jsx:13 [MOVE_RECORDER] 0,0,2,2,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,2,1
// App.jsx:13 [MOVE_RECORDER] 0,0,2,1,2,1
// App.jsx:13 [MOVE_RECORDER] 0,0,2,1,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,0,2
// App.jsx:13 [MOVE_RECORDER] 0,0,0,2,0,0
// App.jsx:13 [MOVE_RECORDER] 0,0,0,1,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,1,2
// App.jsx:13 [MOVE_RECORDER] 0,0,1,2,1,1
// App.jsx:13 [MOVE_RECORDER] 0,0,1,1,1,0
// App.jsx:13 [MOVE_RECORDER] 1,1,1,0,0,2
// App.jsx:13 [MOVE_RECORDER] 1,1,0,2,1,1
// App.jsx:13 [MOVE_RECORDER] 1,1,1,1,0,0
// App.jsx:13 [MOVE_RECORDER] 1,1,0,0,1,1
// App.jsx:13 [MOVE_RECORDER] 1,1,1,1,0,2
// App.jsx:13 [MOVE_RECORDER] 1,1,0,2,0,2
// App.jsx:13 [MOVE_RECORDER] 1,1,0,2,2,2
// App.jsx:13 [MOVE_RECORDER] 1,1,2,2,0,2
// App.jsx:13 [MOVE_RECORDER] 1,1,0,2,0,0
// App.jsx:13 [MOVE_RECORDER] 1,1,0,0,0,0
// App.jsx:13 [MOVE_RECORDER] 1,1,0,0,1,2
// App.jsx:13 [MOVE_RECORDER] 1,1,1,2,2,0
// App.jsx:13 [MOVE_RECORDER] 1,1,2,0,2,2
// App.jsx:13 [MOVE_RECORDER] 1,1,2,2,2,2
// App.jsx:13 [MOVE_RECORDER] 1,1,2,2,0,0
// App.jsx:13 [MOVE_RECORDER] 1,1,0,0,2,2
// App.jsx:13 [MOVE_RECORDER] 0,0,2,2,1,0
// App.jsx:13 [MOVE_RECORDER] 0,0,1,0,1,0
// App.jsx:13 [MOVE_RECORDER] 0,0,1,0,2,2
// App.jsx:13 [MOVE_RECORDER] 0,0,2,2,0,2
// App.jsx:13 [MOVE_RECORDER] 0,0,0,2,2,2
// App.jsx:13 [MOVE_RECORDER] 0,0,2,2,2,0
// App.jsx:13 [MOVE_RECORDER] 2,2,2,0,0,0
// App.jsx:13 [MOVE_RECORDER] 2,2,0,0,0,0
// App.jsx:13 [MOVE_RECORDER] 2,2,0,0,2,1
// App.jsx:13 [MOVE_RECORDER] 2,2,2,1,2,1
// App.jsx:13 [MOVE_RECORDER] 2,2,2,1,0,0
// App.jsx:13 [MOVE_RECORDER] 2,2,0,0,2,2
// App.jsx:13 [MOVE_RECORDER] 2,2,2,2,0,0
// App.jsx:13 [MOVE_RECORDER] 2,2,0,0,1,1
// App.jsx:13 [MOVE_RECORDER] 0,1,1,1,0,0
// App.jsx:13 [MOVE_RECORDER] 0,1,0,0,2,0
// App.jsx:13 [MOVE_RECORDER] 0,1,2,0,0,0
// App.jsx:13 [MOVE_RECORDER] 0,1,0,0,1,0
// App.jsx:13 [MOVE_RECORDER] 0,1,1,0,0,0
// App.jsx:13 [MOVE_RECORDER] 0,1,0,0,0,0
