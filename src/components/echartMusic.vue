<template>
  <div class="EchartMusic">
    <input id="fileChooser" type="file" />
    <div id="myChart" :style="{width: '800px', height: '800px'}"></div>
  </div>
</template>

<script>
import Vue from "vue";
import echarts from "echarts";
import echartsGL from 'echarts-gl' // 引入echarts
Vue.prototype.$echartsGL = echartsGL // 引入组件（将echarts注册为全局）
Vue.prototype.$echarts = echarts;

export default {
  name: "EchartMusic",
  mounted() {
    this.drawLine();
  },
  methods: {
    drawLine() {
      var myChart = this.$echarts.init(document.getElementById("myChart"));
      var UPDATE_DURATION = 100;

      window.AudioContext = window.AudioContext || window.webkitAudioContext;

      var audioContext = new AudioContext();

      // 获取音频资料
      var file;
      var fileContent;
      var dataProvider = [];

      window.onload = function() {
        var fileChooser = document.getElementById("fileChooser");
        fileChooser.onchange = function() {
          if (fileChooser.files[0]) {
            file = fileChooser.files[0];
            // console.log("test---file", file);
            loadFile(file);
          }
        };
      };

      var loadFile = function(file) {
        // console.log("test---进入 loadFile");
        var fileReader = new FileReader();
        // 进行转码
        fileReader.readAsArrayBuffer(file);

        // console.log("test ---fileReader", fileReader);
        // 目前文件的读取状态一直是0
        fileReader.onload = function(e) {
          fileContent = e.target.result;
          // console.log("test---fileContent", fileContent);
          audioContext.decodeAudioData(fileContent, initVisualizer);
        };
      };

      function initVisualizer(audioBuffer) {
        var inited = true;

        var source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Must invoked right after click event
        if (source.noteOn) {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        var analyzer = audioContext.createAnalyser();
        var gainNode = audioContext.createGain();
        analyzer.fftSize = 4096;

        gainNode.gain.value = 1;
        source.connect(gainNode);
        gainNode.connect(analyzer);
        analyzer.connect(audioContext.destination);

        var frequencyBinCount = analyzer.frequencyBinCount;
        var dataArray = new Uint8Array(frequencyBinCount);

        var beta = 0;
        function update() {
          analyzer.getByteFrequencyData(dataArray);

          var item = [];
          var size = 50;

          for (var i = 0; i < size * size; i++) {
            var x = i % size;
            var y = Math.floor(i / size);
            var dx = x - size / 2;
            var dy = y - size / 2;

            var angle = Math.atan2(dy, dx);
            if (angle < 0) {
              angle = Math.PI * 2 + angle;
            }
            var dist = Math.sqrt(dx * dx + dy * dy);
            var idx = Math.min(
              frequencyBinCount - 1,
              Math.round((angle / Math.PI / 2) * 60 + dist * 60) + 100
            );

            var val = Math.pow(dataArray[idx] / 100, 3);
            dataProvider.push([x, y, Math.max(val, 0.1)]);
            // console.log("dataProvider", dataProvider);
          }

          var option = {
            visualMap: {
              show: false,
              min: 0.1,
              max: 4,
              inRange: {
                color: ["#010103", "#2f490c", "#b0b70f", "#fdff44", "#fff"]
              }
            },
            xAxis3D: {
              type: "value"
            },
            yAxis3D: {
              type: "value"
            },
            zAxis3D: {
              type: "value",
              min: -6,
              max: 6
            },
            grid3D: {
              show: false
            },
            series: [
              {
                type: "bar3D",
                silent: true,
                shading: "lambert",
                data: dataProvider,
                barSize: 1
              }
            ]
          };
          myChart.setOption(option);
          beta += 2;

          setTimeout(update, UPDATE_DURATION);
        }

        update();
      }
    }
  }
};
</script>

<style scoped>
</style>
