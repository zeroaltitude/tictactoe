import {useCallback} from "react";
import {debugLog} from "./App";

export function Premover(props) {
    const premove = useCallback((coordinates) => {
        // Create a fake DOM element if the real one doesn't exist
        const cellId = `cell-${coordinates.join('-')}`;
        let targetElement = document.getElementById(cellId);
        // Log the move for debugging
        debugLog("MOVER_DEBUG", `Executing move: ${coordinates.join(',')} with player: ${props.currentPlayer || 'unknown'}`);
        targetElement.click();
    }, [props]);

    const premover = useCallback((moveIndex) => {
        // we're going to fake out event and then find the right treemove by coordinate
        // must assume board size since this is NOT a generic debugging tool: depth = 3
        // here's the dillio: coordinates = [topx, topy, nextx, nexty, nextx, nexty, row, column]
        // Use setTimeout to handle asynchronous state updates
        // This ensures each move is processed completely before the next one
        const moves = [
            // pattern 0: normal win move pattern: move sets super parent coord, win sets superparent coord
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 0],
                [0, 0, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 1]
            ],
            // pattern 1: unrestricted grandparent board move on win BECAUSE COLLISION
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ],
            // pattern 2: top left superboard win with no collision, but WITH restriction at bottom right
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [0, 0, 2, 2, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [0, 0, 2, 1, 2, 1],
                [0, 0, 2, 1, 1, 1],
                [0, 0, 1, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 0, 0],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 1, 0],
                [1, 1, 1, 0, 0, 2],
                [1, 1, 0, 2, 1, 1],
                [1, 1, 1, 1, 0, 0],
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 2],
                [1, 1, 0, 2, 0, 2],
                [1, 1, 0, 2, 2, 2],
                [1, 1, 2, 2, 0, 2],
                [1, 1, 0, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 1, 2],
                [1, 1, 1, 2, 2, 0],
                [1, 1, 2, 0, 2, 2],
                [1, 1, 2, 2, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 2, 2],
                [0, 0, 2, 2, 1, 0],
                [0, 0, 1, 0, 1, 0],
                [0, 0, 1, 0, 2, 2],
                [0, 0, 2, 2, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0]
            ],
            // pattern 3: unrestricted, but proposed restricted, copy pattern but at super board win with double collision, NO restriction
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 2, 0],
                [0, 0, 2, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [0, 0, 2, 2, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [0, 0, 2, 1, 2, 1],
                [0, 0, 2, 1, 1, 1],
                [0, 0, 1, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 0, 0],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 1, 0],
                [1, 1, 1, 0, 0, 2],
                [1, 1, 0, 2, 1, 1],
                [1, 1, 1, 1, 0, 0],
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 2],
                [1, 1, 0, 2, 0, 2],
                [1, 1, 0, 2, 2, 2],
                [1, 1, 2, 2, 0, 2],
                [1, 1, 0, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 1, 2],
                [1, 1, 1, 2, 2, 0],
                [1, 1, 2, 0, 2, 2],
                [1, 1, 2, 2, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 2, 2],
                [0, 0, 2, 2, 1, 0],
                [0, 0, 1, 0, 1, 0],
                [0, 0, 1, 0, 2, 2],
                [0, 0, 2, 2, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0],
                [2, 2, 2, 0, 0, 0],
                [2, 2, 0, 0, 0, 0],
                [2, 2, 0, 0, 2, 1],
                [2, 2, 2, 1, 2, 1],
                [2, 2, 2, 1, 0, 0],
                [2, 2, 0, 0, 2, 2],
                [2, 2, 2, 2, 0, 0],
                [2, 2, 0, 0, 1, 1],
                [0, 1, 1, 1, 0, 0],
                [0, 1, 0, 0, 2, 0],
                [0, 1, 2, 0, 0, 0],
                [0, 1, 0, 0, 1, 0],
                [0, 1, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 0]
            ],
            // pattern 4: testing
            [
                [0, 0, 0, 0, 2, 2],
                [0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 1, 0, 1, 1],
                [0, 0, 1, 1, 0, 1],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 0, 2],
                [0, 0, 0, 2, 1, 1],
                [0, 0, 1, 1, 1, 2],
                [0, 0, 1, 2, 1, 1],
                [0, 0, 1, 1, 2, 2],
                [1, 1, 2, 2, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 2, 0],
                [1, 1, 2, 0, 2, 0],
                [1, 1, 2, 0, 0, 0],
                [1, 1, 0, 0, 0, 1],
                [1, 1, 0, 1, 0, 0],
                [1, 1, 0, 0, 0, 2],
                [0, 0, 0, 2, 2, 2],
                [0, 0, 2, 2, 2, 0],
                [0, 0, 2, 0, 2, 2],
                [0, 0, 2, 2, 2, 1],
                [0, 0, 2, 1, 2, 2],
                [0, 0, 2, 2, 2, 2],
                [2, 2, 2, 2, 0, 0]
            ],
        ];

        // Execute moves with a delay between them
        moves[moveIndex].forEach((move, index) => {
            setTimeout(() => {
                premove(move);
            }, index * 300); // 500ms delay between moves
        });
    }, [premove])

    return (
        <div style={{
            border: "5px solid #031433",
            paddingRight: "20px",
            paddingLeft: "10px",
            backgroundColor: "#222222",
            fontFamily: "monospace"
        }}>
            <h2 style={{color:"white"}}>Premover</h2>
            <button onClick={premover.bind(this, 0)}>[0] Premove 1</button>
            <button onClick={premover.bind(this, 1)}>[1] Premove 2</button>
            <button onClick={premover.bind(this, 2)}>[2] Premove 3</button>
            <button onClick={premover.bind(this, 3)}>[3] Premove 4</button>
            <button onClick={premover.bind(this, 4)}>[4] Premove 5</button>
            <button onClick={premover.bind(this, 5)}>[5] Premove 6</button>
            <button onClick={premover.bind(this, 6)}>[6] Premove 7</button>
        </div>
    )}

export default function Board(props) {
    const letters=['A','B','C']
    return (
        <div style={{
            border:"5px solid #031433",
            paddingRight:"50px",
            backgroundColor:"#222222",
            fontFamily:"monospace"
        }}>
            <ol>
                {props.moveList.map((move) =>
                <li key={move} style={{
                    color:"white"
                }}>{move.map((coord,index) =>
                    index%2===0?letters[coord]:coord+1
                    )}</li>
                )}
            </ol>
        </div>
    )
}

