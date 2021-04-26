



//モデルの情報
let model = 
{
  Translate:
  {
    x: 0,
    y: 0,
    z: -4,
  },

  Rotate:
  {
    x: 0,
    y: 0,
    z: 0,
  },

  Scale:
  {
    x: 1,
    y: 1,
    z: 1,
  },
};



let canvas;         //キャンバス
let gl;             //コンテキスト
//var shaderProgram;  //シェーダープログラムを作成
let buffers;        //バッファー

let programInfo = {  attribLocations: {},uniformLocations: {}  };  //プログラム




//
// エントリーポイント
//
function main() 
{

  
  canvas = document.querySelector('#glcanvas'); //キャンバスを取得
  gl = canvas.getContext('webgl');              //webGLコンテキストを作成
  //webGLコンテキストの作成に失敗した時
  if (!gl) 
  {
    alert("webGLコンテキストの作成失敗");
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 頂点シェーダーコード
  const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  // フラグメントシェーダー
  const fsSource = `
    void main() {
      gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
  `;
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






////////////////////////////////////////////////////////////////////////////////////////////////////////////
//シェーダープログラムオブジェクトを作成
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);//シェーダープログラムを作成

programInfo.shaderProgram = shaderProgram;
programInfo.attribLocations.vertexPosition = gl.getAttribLocation(shaderProgram,'aVertexPosition');
programInfo.uniformLocations.projectionMatrix = gl.getUniformLocation(shaderProgram,'uProjectionMatrix');
programInfo.uniformLocations.modelViewMatrix = gl.getUniformLocation(shaderProgram,'uModelViewMatrix');

  buffers = initBuffers(gl);  //バッファーを作成
  drawScene(gl, programInfo, buffers);  //描画 
////////////////////////////////////////////////////////////////////////////////////////////////////////////
  

  
}


//Update()
function Update()
{
  //window.requestAnimationFrame(Update);

}

//Draw
function Draw()
{
  //window.requestAnimationFrame(Draw);

}




//キー入力
function InputKey()
{
  /*
  document.body.addEventListener("keydown",event => {

    //スペースキー
    if(event.key == " ")
    {
          //alert("キーが押されました。");
          console.log("Space");
    }
    else if(event.key == "ArrowLeft")
    {
          //alert("キーが押されました。");
          console.log("Left");
          model.Translate.x += -1 / 640;
    }
    else if(event.key == "ArrowRight")
    {
          //alert("キーが押されました。");
          console.log("Right");
          model.Translate.x += 1 / 640;

    }
    else if(event.key == "ArrowUp")
    {
          //alert("キーが押されました。");
          console.log("Up");
    }
    else if(event.key == "ArrowDown")
    {
          //alert("キーが押されました。");
          console.log("Down");
    }
});
*/
}



//バッファを初期化
function initBuffers(gl) 
{

  // 正方形の位置用のバッファを作成します。
  const positionBuffer = gl.createBuffer();

  //バッファを適用
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  //正方形の頂点の配列
  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  //バッファーオブジェクトのデータストアを初期化
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);

  return {
    position: positionBuffer,
  };
}


//シーンを描画
function drawScene(gl, program, buffers) 
{
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // カラーバッファを初期化
  gl.clearDepth(1.0);                 // 深度バッファを初期化
  gl.enable(gl.DEPTH_TEST);           // 深度テスト
  gl.depthFunc(gl.LEQUAL);            // 深度比較する値を設定

  //キャンバスに描画を開始する前に、キャンバスをクリア
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //パースペクティブマトリックスを作成します
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;

  //射形行列
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);

  //ビュー行列

  //平行移動
  let translate = new mat4.create();
  mat4.translate(translate,translate,[model.Translate.x,model.Translate.y,model.Translate.z]); 

  //回転
  let rotation = new mat4.create();
  mat4.rotate(rotation,rotation,0,[model.Rotate.x,model.Rotate.y,model.Rotate.z]); 

  //拡大縮小
  let scale = new mat4.create();
  mat4.scale(scale,scale,[model.Scale.x,model.Scale.y,model.Scale.z]); 


// translate * rotate * scale
  let modelViewMatrix = new mat4.create();
  let rs = new mat4.create();
  let trs = new mat4.create();
  mat4.multiply(rs,rotation,scale);
  mat4.multiply(trs,translate,rs);
  modelViewMatrix = trs;
  
  
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);                                          //バッファーを適用
  gl.vertexAttribPointer(program.attribLocations.vertexPosition,2,gl.FLOAT,false,0,0);   //バッファーの頂点属性を統合
  gl.enableVertexAttribArray(program.attribLocations.vertexPosition);                    //バッファーの頂点属性を有効化
  
  //シェーダーを使う
  gl.useProgram(program.shaderprogram); //////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
  // uniform 変数を設定
  gl.uniformMatrix4fv(program.uniformLocations.projectionMatrix,false,projectionMatrix);
  gl.uniformMatrix4fv(program.uniformLocations.modelViewMatrix,false,modelViewMatrix);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  //描画
/////////////////////////////////////////////////////////////////////////////////////////


}

//シェーダーを作成
function initShaderProgram(gl, vsSource, fsSource) 
{
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  //シェーダープログラムを作成
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // もしシェーダープログラムの作成に失敗したら
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('シェーダープログラム作成に失敗:  ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//シェーダーをロード
function loadShader(gl, type, source) 
{
  const shader = gl.createShader(type);

  // ソースをシェーダーオブジェクトに送信します
  gl.shaderSource(shader, source);

  // コンパイルシェーダー
  gl.compileShader(shader);

  // コンパイルが成功したかどうか？
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

  window.onload = main;  //実行
