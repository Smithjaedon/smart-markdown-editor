<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';

	let email = '';
	let password = '';

	async function login(e: Event) {
		e.preventDefault();
		const { data, error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});
		if (data.user) {
			goto('/editor');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<form onsubmit={login} class="w-md rounded-2xl border-1 border-neutral-300 px-6 py-12 shadow-md">
		<div>
			<h1 class="text-2xl font-bold">Sign In</h1>
			<p>Don't have an account? <a href="/signup" class="link link-primary">Sign up now</a></p>
		</div>
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Email</legend>
			<input
				type="email"
				class="input w-full"
				placeholder="example@example.com"
				required
				bind:value={email}
			/>
		</fieldset>
		<fieldset class="fieldset">
			<div class="flex items-center justify-between">
				<legend class="fieldset-legend">Password</legend>
				<legend class="fieldset-legend">Forgot your password?</legend>
			</div>
			<input type="password" class="input w-full" placeholder="" required bind:value={password} />
		</fieldset>
		<button type="submit" class="btn btn-neutral mt-3 w-full">Login</button>
	</form>
</div>
