all: reader.beam scanner.beam parser.beam logger.beam petrijson.beam
	mkdir -p ../nitrogen/lib/parser
	cp reader.beam scanner.beam parser.beam logger.beam petrijson.beam ../nitrogen/lib/parser/

reader.beam: reader.erl
	erl -compile reader.erl

scanner.beam: scanner.erl
	erl -compile scanner.erl

parser.beam: parser.yrl
	echo "yecc:file(parser.yrl)." | erl
	erl -compile parser.erl

logger.beam: logger.erl
	erl -compile logger.erl

petrijson.beam: petrijson.yrl
	echo "yecc:file(petrijson.yrl)." | erl
	erl -compile petrijson.erl

clean:
	rm *.beam
	rm parser.erl
