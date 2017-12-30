'use strict';
(function () {
    document.addEventListener('DOMContentLoaded', ready);
})();

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform vec4 u_Translation;
    uniform float u_CosB, u_SinB;
    void main() {
        gl_Position.x = (a_Position.x + u_Translation.x) * u_CosB - (a_Position.y + u_Translation.y) * u_SinB;
        gl_Position.y = (a_Position.x + u_Translation.x) * u_SinB + (a_Position.y + u_Translation.y) * u_CosB;
        gl_Position.z = a_Position.z;
        gl_Position.w = 1.0;
    }
`;

const FSHADER_SOURCE = `
    void main() {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
`;

function ready() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    const gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }

    const n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    loop(gl, n);

    const uTranslation = gl.getUniformLocation(gl.program, 'u_Translation');
    canvas.addEventListener('mousemove', function (event) {
        const x = (event.clientX - canvas.width / 2) / 200;
        const y = (-event.clientY + canvas.height / 2) / 200;
        gl.uniform4f(uTranslation, x / 10, y / 10, 0.0, 0.0);
    });
}

function loop(gl, n) {
    let ANGLE = 0;
    setInterval(function () {
        ANGLE = ANGLE % 360;
        const radian = Math.PI * ANGLE / 180.0;
        const cosB = Math.cos(radian);
        const sinB = Math.sin(radian);

        const u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
        const u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
        gl.uniform1f(u_CosB, cosB);
        gl.uniform1f(u_SinB, sinB);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.LINE_LOOP, 0, n);
        ANGLE++;
    }, 3);
}

let coords = [
    -0.1, 0.1, -0.1, -0.1, 0.1, 0.1, 0.1, -0.1
];

function initVertexBuffers(gl) {
    const vertices = new Float32Array(coords);
    const n = 4;

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