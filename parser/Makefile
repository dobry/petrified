all: reader.beam scanner.beam parser.beam printer.beam
	mkdir -p ../nitrogen/lib/parser
	cp reader.beam scanner.beam parser.beam printer.beam ../nitrogen/lib/parser/

printer.beam: printer.erl
	erl -compile printer.erl

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
