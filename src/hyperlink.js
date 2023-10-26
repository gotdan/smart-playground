import { hyperLinkExtension } from '@uiw/codemirror-extensions-hyper-link';

export default function buildHyperlinkExtension(serverUrl, EditorView, onClick) {

	function handleClick(e) {
		let parent = e.target.parentNode;
		if (parent.nodeName == "svg") 
			parent = parent.parentNode;
		onClick(e, parent.getAttribute("href"));
	}

	const simplifiedServerUrl = serverUrl.replace(/\/sim\/[^\/]+/, "");
	const linkRegex = new RegExp(
		"(" + simplifiedServerUrl + "[^\\s\"']+)" +
		"|(" + serverUrl  + "[^\\s\"']+)" +
		"|((?:[\"\']\s*)[A-Z]\\w+\/[\\w-]+)",
	"gi");
	
	return [
		hyperLinkExtension({
			regexp: linkRegex,
			anchor: element => {
				element.addEventListener("click", handleClick, false); 
				return element;
			},
			handle: value => value.replace(/^[\"\']/, "")
		}),
		EditorView.baseTheme({
			'.cm-hyper-link-icon': {
				display: 'inline-block',
				verticalAlign: 'middle',
				marginLeft: '0.2ch',
			},
			'.cm-hyper-link-icon svg': {
				display: 'block',
			}
		})
	];
}