<template>
	<ClientOnly>
		<div class="num-tunes">
			<div class="language- my-code">
				<span class="code-results">{{answer}}</span>
				<span> = ABCJS.numberOfTunes(tunebookString);</span>
			</div>
		</div>
	</ClientOnly>
</template>

<script>
	import { nextTick } from 'vue';
	export default {
		name: "num-tunes",
		data() {
			return {
				answer: "",
				abcjs: null,
			};
		},
		mounted() {
			nextTick(() => {
				this.abcjs = require('../../../index');
			});
		},
		methods: {
			redraw(tunebookString) {
				this.answer = this.abcjs.numberOfTunes(tunebookString);
			}
		}
	}
</script>
