all: reader.beam scanner.beam parser.beam logger.beam
	mkdir -p ../nitrogen/lib/parser
	cp reader.beam scanner.beam parser.beam logger.beam ../nitrogen/lib/parser/

reader.beam: reader.erl
	erl -compile reader.erl

scanner.beam: scanner.erl
	erl -compile scanner.erl

parser.beam: parser.yrl
	echo "yecc:file(parser.yrl)." | erl
	erl -compile parser.erl

logger.beam: logger.erl
	erl -compile logger.erl

clean:
	rm *.beam
	rm parser.erl
