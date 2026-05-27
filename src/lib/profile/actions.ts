"use server";

import { updateProfile as updateProfileAction } from "./actions/profile-actions";
import {
	updateEmail as updateEmailAction,
	updatePassword as updatePasswordAction,
} from "./actions/security-actions";
import {
	deactivateAccount as deactivateAccountAction,
	reactivateAccount as reactivateAccountAction,
} from "./actions/account-actions";

export async function updateProfile(
	...args: Parameters<typeof updateProfileAction>
) {
	return updateProfileAction(...args);
}

export async function updateEmail(...args: Parameters<typeof updateEmailAction>) {
	return updateEmailAction(...args);
}

export async function updatePassword(
	...args: Parameters<typeof updatePasswordAction>
) {
	return updatePasswordAction(...args);
}

export async function deactivateAccount(
	...args: Parameters<typeof deactivateAccountAction>
) {
	return deactivateAccountAction(...args);
}

export async function reactivateAccount(
	...args: Parameters<typeof reactivateAccountAction>
) {
	return reactivateAccountAction(...args);
}
