/*jslint node: true, browser: true */
/*jslint plusplus: true */
/*global alert */
"use strict";
function GraphicsView() {
    var canvas = document.getElementById("mycanvas"),
        context = canvas.getContext("2d"),
        dx = 2,
        dy = -2,
        count = 0,
        brickSpec = {width: window.innerWidth / 10, height: window.innerWidth / 12},
        ballSpec = {x: window.innerWidth / 2, y: window.innerHeight / 2, r: 8, fillColor: "#fd682e"},
        paddleSpec = { x: (window.innerWidth / 2) - 30, y: window.innerHeight - 20, fillColor: "#34675c", width: 60, height: 20},
        brickWallSpec = { width: 10, height: 4},
        brickHits = [],
        i,
        j,
        round0 = function (x) {
            return Math.round(x);
        },
        initBrickHits = function () {
            for (i = 0; i < brickWallSpec.width; i++) {
                var col = [];
                for (j = 0; j < brickWallSpec.height; j++) {
                    col.push(0);    // 0 means not hit
                }
                brickHits.push(col);
            }
        },
        clearBrickHits = function () {
            for (i = 0; i < brickWallSpec.width; i++) {
                for (j = 0; j < brickWallSpec.height; j++) {
                    brickHits[i][j] = 0; // 0 means not hit
                }
            }
        },
        tiltPaddle = function () { //use of the accelerometer
            var oldX = 9999, oldY = 0, oldZ = 0, f = 0.01;
            if (window.DeviceMotionEvent) {
                window.addEventListener("devicemotion", function (event) {
                    var x = event.accelerationIncludingGravity.x, y = event.accelerationIncludingGravity.y, z = event.accelerationIncludingGravity.z, roll;
                    if (oldX == 9999) {
                        oldX = x;
                        oldY = y;
                        oldZ = z;
                    } else {
                        oldX = f * x + (1 - f) * oldX;
                        oldY = f * y + (1 - f) * oldY;
                        oldZ = f * z + (1 - f) * oldZ;
                    }
                    roll = Math.atan(-x / Math.sqrt(oldY * oldY + oldZ * oldZ)) * 180 / Math.PI;
                    if (round0(roll) > 5  && paddleSpec.x + paddleSpec.width < canvas.width) {
                        paddleSpec.x = paddleSpec.x + 4;
                    } else if (round0(roll) < -5 && paddleSpec.x > 0) {
                        paddleSpec.x = paddleSpec.x - 4;
                    }
                });
            }
        },
        resetValues = function () {
            ballSpec.x = (window.innerWidth / 2);
            ballSpec.y = (window.innerHeight / 2);
            paddleSpec.x = (window.innerWidth / 2) - 30;
            paddleSpec.y = window.innerHeight - 20;
            dx = 2;
            dy = -2;
            count = 0;
        },
        wallsCollision = function () {
            if (ballSpec.x < ballSpec.r || ballSpec.x > canvas.width - ballSpec.r) {
                dx = -dx;
            }
            if (ballSpec.y < ballSpec.r || ballSpec.y > canvas.height - ballSpec.r) {
                dy = -dy;
            }
        },
        paddleCollision = function () {
            //checking for collision on top of paddle 
            if ((ballSpec.x + ballSpec.r) >= paddleSpec.x && (ballSpec.x - ballSpec.r) <= (paddleSpec.x + paddleSpec.width)) {
                if ((ballSpec.y + ballSpec.r) >= paddleSpec.y && (ballSpec.y + ballSpec.r) <= paddleSpec.y + 1) {
                    dy = -dy;
                }
            }
            //checking for collision on left and right side of paddle
            if ((ballSpec.x + ballSpec.r) >= paddleSpec.x && (ballSpec.x + ballSpec.r) <= (paddleSpec.x + 1)) {
                if ((ballSpec.y + ballSpec.r) >= paddleSpec.y && (ballSpec.y - ballSpec.r) <= (paddleSpec.y + paddleSpec.height)) {
                    dx = -dx;
                }
            }
            if ((ballSpec.x - ballSpec.r) >= (paddleSpec.x + paddleSpec.width) && (ballSpec.x - ballSpec.r) <= (paddleSpec.x + paddleSpec.width + 1)) {
                if ((ballSpec.y + ballSpec.r) >= paddleSpec.y && (ballSpec.y - ballSpec.r) <= (paddleSpec.y + paddleSpec.height)) {
                    dx = -dx;
                }
            }
        },
        brickCollision = function () {
            for (i = 0; i < brickWallSpec.width; i++) {
                for (j = 0; j < brickWallSpec.height; j++) {
                    if (brickHits[i][j] == 0) {
                        //collision at the bottom of the brick
                        if (ballSpec.x >= (i * brickSpec.width) && ballSpec.x <= (i * brickSpec.width + brickSpec.width)) {
                            if ((ballSpec.y - ballSpec.r) <= (j * brickSpec.height + brickSpec.height) && (ballSpec.y - ballSpec.r) >= (j * brickSpec.height)) {
                                dy = -dy;
                                ballSpec.y += dy;
                                brickHits[i][j] = 1; //a brick was hit
                                count += 1;         //count the brick hit
                            }
                        }
                        //collision at the top of the brick
                        if (ballSpec.x >= (i * brickSpec.width) && ballSpec.x <= (i * brickSpec.width + brickSpec.width)) {
                            if ((ballSpec.y + ballSpec.r) >= (j * brickSpec.height) && (ballSpec.y + ballSpec.r) <= (j * brickSpec.height + brickSpec.height)) {
                                dy = -dy;
                                ballSpec.y += dy;
                                brickHits[i][j] = 1;
                                count += 1;
                            }
                        }
                        //collision at the left of the brick
                        if ((ballSpec.x + ballSpec.r) >= (i * brickSpec.width) && (ballSpec.x + ballSpec.r) <= (i * brickSpec.width + brickSpec.width)) {
                            if (ballSpec.y >= (j * brickSpec.height) && ballSpec.y <= (j * brickSpec.height + brickSpec.height)) {
                                dx = -dx;
                                ballSpec.x += dx;
                                brickHits[i][j] = 1;
                                count += 1;
                            }
                        }
                       //collision at the right of the brick
                        if ((ballSpec.x - ballSpec.r) <= (i * brickSpec.width + brickSpec.width)  && (ballSpec.x - ballSpec.r) >= (i * brickSpec.width)) {
                            if (ballSpec.y >= (j * brickSpec.height) && ballSpec.y <= (j * brickSpec.height + brickSpec.height)) {
                                dx = -dx;
                                ballSpec.x += dx;
                                brickHits[i][j] = 1;
                                count += 1;
                            }
                        }
                    }
                }
            }
        },
        drawBrickWall = function () {
            for (i = 0; i < brickWallSpec.width; i++) {
                for (j = 0; j < brickWallSpec.height; j++) {
                    if (brickHits[i][j] == 0) {
                        if (j == 0) {
                            context.fillStyle = "#0f5967";
                        } else if (j == 1) {
                            context.fillStyle = "#1995ad";
                        } else if (j == 2) {
                            context.fillStyle = "#a1d6e2";
                        } else {
                            context.fillStyle = "#d9eef3";
                        }
                        context.fillRect(i * brickSpec.width, j * brickSpec.height, brickSpec.width, brickSpec.height);
                        context.fill();
                        context.strokeStyle = "#34675c";
                        context.lineWidth = 2;
                        context.strokeRect(i * brickSpec.width, j * brickSpec.height, brickSpec.width, brickSpec.height);
                    }
                }
            }
        },
        drawBall = function () {
            context.beginPath();
            context.fillStyle = ballSpec.fillColor;
            context.arc(ballSpec.x, ballSpec.y, ballSpec.r, 0, 360);
            context.closePath();
            context.fill();
        },
        drawPaddle = function () {
            context.beginPath();
            context.fillStyle = paddleSpec.fillColor;
            context.rect(paddleSpec.x, paddleSpec.y, paddleSpec.width, paddleSpec.height);
            context.closePath();
            context.fill();
        },
        checkResult = function () {
            if ((paddleSpec.y + paddleSpec.height) < (ballSpec.y + ballSpec.r)) {
                alert("You lost. Try Again.");
                clearBrickHits();
                resetValues();
            } else {
                ballSpec.x += dx;
                ballSpec.y += dy;
                if (count == (brickWallSpec.width * brickWallSpec.height)) {
                    alert("Congratulations! You won!");
                    clearBrickHits();
                    resetValues();
                }
            }
        },
        canvasPaint = function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            context.clearRect(0, 0, canvas.width, canvas.height); //erase canvas before draw
            context.fillStyle = "#a1be95";
            context.fillRect(0, 0, canvas.width, canvas.height);
            wallsCollision();
            paddleCollision();
            brickCollision();
            drawBrickWall();
            drawPaddle();
            drawBall();
            checkResult();
        };

    this.init = function () {
        console.log("Starting view..");
        tiltPaddle();
        initBrickHits();
        setInterval(canvasPaint, 10);
    };
}
