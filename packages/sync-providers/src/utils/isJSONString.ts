export default function IsJSONString(str: string) {
	try {
		JSON.parse(str);
	} catch {
		return false;
	}
	return true;
}
