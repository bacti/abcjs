<template>
	<div class="abcjs-editor">
		<textarea ref="textarea" id="abc"></textarea>
		<div id="warnings"></div>
		<div id="paper"></div>
	</div>
</template>

<script>
	import { nextTick } from 'vue';

	export default {
		name: "abcjs-editor",
		watch: {
			callbacks() {
				this.onchange();
			},
			abc() {
				this.$refs.textarea.value = this.abc;
				const abcjs = require('../../../index');
				const abc_editor = new abcjs.Editor("abc", {
					canvas_id: "paper",
					warnings_id: "warnings",
					onchange: this.onchange,
					abcjsParams: { add_classes: true, responsive: "resize" },
					indicate_changed: true,
				});
			}
		},
		props: {
			abc: {
				type: String,
				required: true
			},
			callbacks: {
				type: Array,
				required: false
			},
		},
		mounted() {
			nextTick(() => {
				this.$refs.textarea.value = this.abc;
				const abcjs = require('../../../index');
				const abc_editor = new abcjs.Editor("abc", {
					canvas_id: "paper",
					warnings_id: "warnings",
					onchange: this.onchange,
					abcjsParams: { add_classes: true, responsive: "resize" },
					indicate_changed: true,
				});
			});
		},
		methods: {
			onchange() {
				if (this.callbacks) {
					this.callbacks.forEach(fn => {
						if (fn.redraw)
							fn.redraw(this.$refs.textarea.value);
					})
				}
			},
		},
	}
</script>

<style>
	#warnings {
		color: red;
	}
</style>
