'use strict';
(function () {
    document.addEventListener('DOMContentLoaded', ready);
})();

const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = a_Size;
    }
`;

const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_Color;
    void main() {
        gl_FragColor = u_Color;
    }
`;

function ready() {
    let canvas = document.getElementById('canvas');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    let gl = getWebGLContext(canvas);

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders');
        return;
    }
    let aPosition = gl.getAttribLocation(gl.program, 'a_Position');
    let aSize = gl.getAttribLocation(gl.program, 'a_Size');
    let uColor = gl.getUniformLocation(gl.program, 'u_Color');

    gl.vertexAttrib3f(aPosition, 0.0, 0.0, 0.0);
    gl.uniform4f(uColor, 0.0, 1.0, 0.0, 1.0);
    gl.vertexAttrib1f(aSize, 10);

    //Указываем цвет для очистки canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);


    let tC = 10;
    let t = tC;
    canvas.addEventListener('mousemove', function (event) {
        const x = (event.clientX - canvas.width / 2) / 200;
        const y = (-event.clientY + canvas.height / 2) / 200;
        gl.vertexAttrib3f(aPosition, x, y, 0.0);
        if (t < 0) {
            const colors = [Math.random(), Math.random(), Math.random(), Math.random()];
            gl.uniform4f(uColor, ...colors);
            t = tC;
        }
        gl.vertexAttrib1f(aSize, (event.clientX / 2 + event.clientY / 2) / (canvas.width / 2 + canvas.height / 2) * 100);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.POINTS, 0, 1);
        t--;
    });
}