document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const resetBtn = document.querySelector('#reset-button');
    const width = 10;
    let current = 0;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    let gamePlaying = true;

    // Tetromino objects
    const lTetromino = {
        name: "l",
        shape: [
            [1, width + 1, width * 2 + 1, 2],
            [width, width + 1, width + 2, width * 2 + 2],
            [1, width + 1, width * 2 + 1, width * 2],
            [width, width * 2, width * 2 + 1, width * 2 + 2]
        ]
    }

    const zTetromino = {
        name: "z",
        shape: [
            [0, width, width + 1, width * 2 + 1],
            [width + 1, width + 2, width * 2, width * 2 + 1],
            [0, width, width + 1, width * 2 + 1],
            [width + 1, width + 2, width * 2, width * 2 + 1]
        ]
    }

    const tTetromino = {
        name: "t",
        shape: [
            [1, width, width + 1, width + 2],
            [1, width + 1, width + 2, width * 2 + 1],
            [width, width + 1, width + 2, width * 2 + 1],
            [1, width, width + 1, width * 2 + 1]
        ]
    }

    const oTetromino = {
        name: "o",
        shape: [
            [0, 1, width, width + 1],
            [0, 1, width, width + 1],
            [0, 1, width, width + 1],
            [0, 1, width, width + 1]
        ]
    }


    const iTetromino = {
        name: "i",
        shape: [
            [1, width + 1, width * 2 + 1, width * 3 + 1],
            [width, width + 1, width + 2, width + 3],
            [1, width + 1, width * 2 + 1, width * 3 + 1],
            [width, width + 1, width + 2, width + 3]
        ]
    }

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

    let currentPosition = 4;
    let currentRotation = 0;

    // randomly select a tetromino

    let random = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random].shape[currentRotation];

    // draw first teromino 
    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
        })
    }

    function unDraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        })
    }

    // move down every second
    // timerId = setInterval(moveDown, 500);

    // assign functions to keyCodes
    function control(e) {
        if (gamePlaying) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            }
        }

    }

    document.addEventListener('keydown', control);

    // move down function
    function moveDown() {
        unDraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // freeze function
    function freeze() {
        if (current.some(index => squares[(currentPosition + index + width)].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            //start a new tetromino falling
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random].shape[currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        }
    }

    // move teromino left, unless it touches the edge
    function moveLeft() {
        unDraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

        if (!isAtLeftEdge) currentPosition -= 1;

        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        };

        draw();
    }

    function moveRight() {
        unDraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // rotate tetromino
    function rotate() {
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        const isAtBottom = current.some(index => squares[currentPosition + index + (width * 2)].classList.contains('taken'));
        const twoGridSpacesLeft = current.some(index => squares[currentPosition + index + (width * 3)].classList.contains('taken'));
        let dontRotate = false;

        // account for edge cases. WHen tetromino is rotated it should not overflow the available grid spaces
        // When 'l' tetromino's shape equals shape[0] AND is up against the left side -> move it to the right one grid space to prevent grid overflow
        if (current === theTetrominoes[0].shape[0] && isAtLeftEdge) {
            moveRight()
        }
        // OR equals shape[0] AND is up against right side -> move it to the left
        if (current === theTetrominoes[0].shape[2] && isAtRightEdge) {
            moveLeft();
        }

        // When 'z' teromino's shape equals shape[0] OR shape[2] AND is up against the right side -> move it to the left one grid space to prevent grid overflow
        if ((current === theTetrominoes[1].shape[0] && isAtRightEdge) || (current === theTetrominoes[1].shape[2] && isAtRightEdge)) {
            moveLeft();
        }

        // when 't' tetromino's shape equals shape[3] AND is up against the right side -> move it to the left one grid space to prevent grid overflow
        if (current === theTetrominoes[2].shape[3] && isAtRightEdge) {
            moveLeft();
        }
        // OR equals shape[1] AND is up against left side -> move it to the right
        if (current === theTetrominoes[2].shape[1] && isAtLeftEdge) {
            moveRight();
        }
        // if tetronimo equals 't' and position is 0(reversed) t. You should not be allowed to rotate to prevent grid overflow at the bottom of the grid
        if (current === theTetrominoes[2].shape[0] && isAtBottom) {
            dontRotate = true;
        }

        // When 'I' tetromino's shape equals shape[0] OR shape[2] AND is up to left side -> move it to the right one grid space to prevent grid overflow
        if ((current === theTetrominoes[4].shape[0] && isAtLeftEdge) || (current === theTetrominoes[4].shape[2] && isAtLeftEdge)) {
            moveRight();
        }
        // OR equals shape[0] OR shape[2] AND is up to right side -> move it to the left two grid spaces to prevent grid overflow
        if ((current === theTetrominoes[4].shape[0] && isAtRightEdge) || (current === theTetrominoes[4].shape[2] && isAtRightEdge)) {
            moveLeft();
            moveLeft();
        }
        // if tetromino equals 'I' and position is 1 or 3. You should no longer be able to rotate to prevent grid overflow at the bottom of the grid
        if ((current === theTetrominoes[4].shape[1] && twoGridSpacesLeft) || (current === theTetrominoes[4].shape[3] && twoGridSpacesLeft)) {
            dontRotate = true;
        }

        // actual rotation
        if (!dontRotate) {
            unDraw();
            currentRotation++;
            if (currentRotation === current.length) {
                currentRotation = 0;
            }
            current = theTetrominoes[random].shape[currentRotation];
            draw();
        }

    }

    // show tetromino that is up next
    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    let displayIndex = 0;

    // Tetrominos without rotations
    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2], //lTetromino
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //zTetromino
        [1, displayWidth, displayWidth + 1, displayWidth + 2], //tTetromino
        [0, 1, displayWidth, displayWidth + 1], //oTetromino
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1] //iTetromino
    ]

    // display shape in mini-grid
    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
        })
    }

    // make start/pause button work
    startBtn.addEventListener('click', () => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            draw();
            timerId = setInterval(moveDown, 500);
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
        }
    })

    resetBtn.addEventListener('click', () => {
        location.reload();
    })

    //add score
    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10
                scoreDisplay.innerHTML = score
                row.forEach(index => {
                    squares[index].classList.remove('taken')
                    squares[index].classList.remove('tetromino')
                    squares[index].style.backgroundColor = ''
                })
                const squaresRemoved = squares.splice(i, width)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell))
            }
        }
    }

    //game over
    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            startBtn.style.display = 'none';
            clearInterval(timerId);
            gamePlaying = false;
        }
    }

});

