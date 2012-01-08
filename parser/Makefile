all: generate.beam reader.beam scanner.beam parser.beam printer.beam
	mkdir -p ../nitrogen/lib/parser
	cp generate.beam reader.beam scanner.beam parser.beam printer.beam ../nitrogen/lib/parser/

generate.beam: generate.erl
	erl -compile generate.erl

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
