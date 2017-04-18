gh-publish:
	cp -R dist/* docs/*
	git add docs/*
	git commit -m 'Publishing to github page'
	git push
