'use strict';
(function () {
    document.addEventListener('DOMContentLoaded', ready);
})();

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_xformMatrix;
    void main() {
        gl_Position = u_xformMatrix * a_Position;
    }
`;

const FSHADER_SOURCE = `
    void main() {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
`;

let X = 0.0;
let Y = 0.0;
let gl;
let n;
let u_xformMatrix;

function ready() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    loop();

    canvas.addEventListener('mousemove', function (event) {
        const x = (event.clientX - canvas.width / 2) / 200;
        const y = (-event.clientY + canvas.height / 2) / 200;

        X = x;
        Y = y;
    });
}

let ANGLE = 0;

function loop() {
    ANGLE += 2;
    ANGLE = ANGLE % 360;
    const radian = Math.PI * ANGLE / 180.0;
    const cosB = Math.cos(radian);
    const sinB = Math.sin(radian);

    const xformMatrix = new Float32Array([
        cosB, sinB, sinB, 0.0,
        -sinB, cosB, 0.0, 0.0,
        0.0, 0.0, cosB, 0.0,
        X, Y, 0.0, 1.0
    ]);

    // Передать матрицу вращения в вершинный шейдер
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, n);
    requestAnimationFrame(loop);
}

function initVertexBuffers(gl) {
    const coords = [
        0.0, 0.1,
        -0.1, -0.1,
        0.1, -0.1
    ];
    const vertices = new Float32Array(coords);
    const n = 3;

    // Создать буферный объект
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Определить тип буферного объекта
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Записать данные в буфферный объект
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(gl.program, 'a_Position');

    // Сохранить ссылку на буферный объект в переменной a_Position
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Разрешить присваивание переменной a_Position
    gl.enableVertexAttribArray(aPosition);

    return n;
}