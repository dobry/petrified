all: reader.beam scanner.beam parser.beam
	mkdir ../nitrogen/lib/parser
	cp reader.beam scanner.beam parser.beam ../nitrogen/lib/parser/

reader.beam: reader.erl
	erl -compile reader.erl

scanner.beam: scanner.erl
	erl -compile scanner.erl

parser.beam: parser.yrl
	echo "yecc:file(parser.yrl)." | erl
	erl -compile parser.erl

clean:
	rm *.beam
	rm parser.erl
