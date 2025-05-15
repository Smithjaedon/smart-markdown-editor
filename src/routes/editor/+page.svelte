<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	import type { User } from '@supabase/supabase-js';
	import { marked } from 'marked';
	import { onDestroy, onMount } from 'svelte';
	import { AlignCenter, AlignLeft, AlignRight, AlignJustify } from 'lucide-svelte';

	let user: User | null = null;
	let email: string | undefined = '';
	let markdown = $state<string>(
		'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
	);
	let preview = $state<string>(
		'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?'
	);
	$effect(() => {
		preview = markdown;
		renderColorSyntax();
		renderAlignmentSyntax();
	});

	async function getUser() {
		const { data, error } = await supabase.auth.getUser();
		if (data.user) {
			user = data.user;
			email = user.email;
		}
	}

	async function signOut() {
		const { error } = await supabase.auth.signOut();
		if (!error) {
			goto('/login');
		}
	}

	function applyWrapper(wrapper: string) {
		const txtarea = document.getElementById('right') as HTMLTextAreaElement;
		if (!markdown) return;

		const start = txtarea.selectionStart;
		const end = txtarea.selectionEnd;
		let selected = txtarea.value.slice(start, end);

		const before = txtarea.value.slice(0, start);
		const after = txtarea.value.slice(end);

		const wrapperLength = wrapper.length;
		const isWrapped = selected.startsWith(wrapper) && selected.endsWith(wrapper);

		if (isWrapped) {
			selected = selected.slice(wrapperLength, -wrapperLength);
			txtarea.value = `${before}${selected}${after}`;
			txtarea.selectionStart = start;
			txtarea.selectionEnd = end - 2 * wrapperLength;
		} else {
			txtarea.value = `${before}${wrapper}${selected}${wrapper}${after}`;
			txtarea.selectionStart = start;
			txtarea.selectionEnd = end + 2 * wrapperLength;
		}

		markdown = txtarea.value;
		preview = markdown;
	}

	function applyStart(wrapper: string) {
		const txtarea = document.getElementById('right') as HTMLTextAreaElement;

		if (!markdown) return;

		const start = txtarea.selectionStart;
		const end = txtarea.selectionEnd;
		let selected = txtarea.value.slice(start, end);

		const before = txtarea.value.slice(0, start);
		const after = txtarea.value.slice(end);

		const wrapperLength = wrapper.length;
		const isWrapped = selected.startsWith(wrapper);

		if (isWrapped) {
			selected = selected.slice(wrapperLength);
			txtarea.value = `${before}${selected}${after}`;
			txtarea.selectionStart = start;
			txtarea.selectionEnd = end - wrapperLength;
		} else {
			txtarea.value = `${before}${wrapper}${selected}${after}`;
			txtarea.selectionStart = start + wrapperLength;
			txtarea.selectionEnd = end + wrapperLength;
		}

		markdown = txtarea.value;
		preview = markdown;
	}

	function renderColorSyntax() {
		preview = markdown.replace(/\{([^}]+)\}(.*?)\{\/\1\}/g, '<span style="color: $1;">$2</span>');
	}

	function renderAlignmentSyntax() {
		preview = markdown.replace(/\{([^}]+)\}(.*?)\{\/\1\}/g, (match, align, content) => {
			if (['left', 'center', 'right', 'justify'].includes(align)) {
				return `<div style="text-align: ${align};">${content}</div>`;
			}
			return match;
		});
	}

	function applyColor(color: string) {
		const txtarea = document.getElementById('right') as HTMLTextAreaElement;

		if (!markdown) return;

		const start = txtarea.selectionStart;
		const end = txtarea.selectionEnd;
		let selected = txtarea.value.slice(start, end);

		// const colorWrapper = `<span style="color: ${color};">`;
		// const colorCloser = '</span>';
		const colorWrapper = `{${color}}`;
		const colorCloser = `{/${color}}`;

		const before = txtarea.value.slice(0, start);
		const after = txtarea.value.slice(end);

		const colorRegex = new RegExp(`{${color}}(.*?){/${color}}`);
		// const colorRegex = new RegExp(`<span style="color: ${color};">(.*?)</span>`);
		if (colorRegex.test(selected)) {
			selected = selected.replace(colorRegex, '$1');
		} else {
			selected = selected.replace(new RegExp(`\\{${color}\\}(.*?)\\{/${color}\\}`, 'g'), '$1');
			selected = `${colorWrapper}${selected}${colorCloser}`;
		}

		txtarea.value = `${before}${selected}${after}`;
		txtarea.selectionStart = start;
		txtarea.selectionEnd = start + selected.length;
		markdown = txtarea.value;
		renderColorSyntax();
	}

	function applyAlign(align: string) {
		const txtarea = document.getElementById('right') as HTMLTextAreaElement;

		if (!markdown) return;

		const start = txtarea.selectionStart;
		const end = txtarea.selectionEnd;
		let selected = txtarea.value.slice(start, end);

		const alignWrapper = `{${align}}`;
		const alignCloser = `{/${align}}`;

		const before = txtarea.value.slice(0, start);
		const after = txtarea.value.slice(end);

		const alignRegex = new RegExp(`\\{${align}\\}(.*?)\\{/${align}\\}`);
		if (alignRegex.test(selected)) {
			selected = selected.replace(alignRegex, '$1');
		} else {
			selected = `${alignWrapper}${selected}${alignCloser}`;
		}

		txtarea.value = `${before}${selected}${after}`;
		txtarea.selectionStart = start;
		txtarea.selectionEnd = start + selected.length;
		markdown = txtarea.value;
	}

	onMount(() => {
		const handleKey = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
				e.preventDefault();
				applyWrapper('**');
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
				e.preventDefault();
				applyWrapper('*');
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
				e.preventDefault();
				applyWrapper('~~');
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				applyWrapper('`');
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
				e.preventDefault();
				applyWrapper('==');
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
				e.preventDefault();
				applyStart('> ');
			}
		};

		window.addEventListener('keydown', handleKey);

		onDestroy(() => {
			window.removeEventListener('keydown', handleKey);
		});
	});
</script>

<div class="grid min-h-screen grid-rows-[61px_3rem_1fr]">
	<div class="navbar bg-base-100 sticky top-0 z-10 flex-none shadow-sm">
		<div class="flex-1">
			<a class="btn btn-ghost text-xl">GlyphNote</a>
		</div>
		<div class="mr-3 flex items-center justify-center"></div>
		<div class="flex gap-2">
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-neutral" onclick={signOut}>Settings</div>
				<ul
					tabindex="0"
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
				>
					<li onclick={signOut}><a>Logout</a></li>
				</ul>
			</div>
		</div>
	</div>
	<div class="bg-base-200 flex h-full w-full items-center">
		<ul class="menu menu-horizontal bg-base-200 rounded-box">
			<li>
				<button class="" popovertarget="popover-1" style="anchor-name:--anchor-1"> File </button>
				<ul
					class="dropdown menu rounded-box bg-base-100 w-52 shadow-sm"
					popover
					id="popover-1"
					style="position-anchor:--anchor-1"
				>
					<li><a href="#open">Open</a></li>
					<li><a href="#save">Save</a></li>
					<li><a id="export-btn" href="#export">Export</a></li>
				</ul>
			</li>
			<!-- <li>
				<button class="" popovertarget="popover-2" style="anchor-name:--anchor-2"> Edit </button>
				<ul
					class="dropdown menu rounded-box bg-base-100 w-52 shadow-sm"
					popover
					id="popover-2"
					style="position-anchor:--anchor-2"
				>
					<li><a>Item 1</a></li>
					<li><a>Item 2</a></li>
				</ul>
			</li> -->
			<!-- <li><a href="#bold">Bold</a></li> -->
			<li>
				<button class="" popovertarget="popover-2" style="anchor-name:--anchor-2"> Colors </button>
				<ul
					class="dropdown menu rounded-box bg-base-100 w-52 shadow-sm"
					popover
					id="popover-2"
					style="position-anchor:--anchor-2"
				>
					<li><a class="font-bold text-black" onclick={() => applyColor('black')}>black</a></li>
					<li><a class="font-bold text-gray-500" onclick={() => applyColor('gray')}>gray</a></li>
					<li><a class="font-bold text-red-500" onclick={() => applyColor('red')}>red</a></li>
					<li>
						<a class="font-bold text-orange-500" onclick={() => applyColor('orange')}>orange</a>
					</li>
					<li>
						<a class="font-bold text-yellow-500" onclick={() => applyColor('yellow')}>yellow</a>
					</li>
					<li><a class="font-bold text-green-500" onclick={() => applyColor('green')}>green</a></li>
					<li><a class="font-bold text-blue-500" onclick={() => applyColor('blue')}>blue</a></li>
					<li>
						<a class="font-bold text-purple-500" onclick={() => applyColor('purple')}>purple</a>
					</li>
					<li><a class="font-bold text-pink-500" onclick={() => applyColor('pink')}>pink</a></li>
				</ul>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm" onclick={() => applyAlign('left')}>
					<AlignLeft size={16} />
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm" onclick={() => applyAlign('center')}>
					<AlignCenter size={16} />
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm" onclick={() => applyAlign('right')}>
					<AlignRight size={16} />
				</button>
			</li>
			<li>
				<button class="btn btn-ghost btn-sm" onclick={() => applyAlign('justify')}>
					<AlignJustify size={16} />
				</button>
			</li>
		</ul>
	</div>
	<div>
		<div class="h-full overflow-hidden">
			<div id="window" class={`grid h-full grid-cols-[1fr_auto_1fr]`}>
				<div id="left" class="prose preview overflow-auto p-6">
					{@html marked(preview)}
				</div>
				<div id="divider" class="divider divider-horizontal"></div>
				<textarea
					id="right"
					bind:value={markdown}
					class={`textarea textarea-ghost h-full w-full resize-none focus:border-transparent focus:ring-0 focus:outline-none`}
				></textarea>
			</div>
		</div>
	</div>
</div>
