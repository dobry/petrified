all: reader.beam scanner.beam parser.beam logger.beam petrijson.beam printer.beam parser2.beam scanner2.beam
	mkdir -p ../nitrogen/lib/parser
	cp reader.beam scanner.beam parser.beam logger.beam petrijson.beam printer.beam parser2.beam scanner2.beam ../nitrogen/lib/parser/

printer.beam: printer.erl
	erl -compile printer.erl

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

scanner2.beam: scanner2.erl
	erl -compile scanner2.erl

parser2.beam: parser2.yrl
	echo "yecc:file(parser2.yrl)." | erl
	erl -compile parser2.erl

clean:
	rm *.beam
	rm parser.erl
	rm parser2.erl
	rm petrijson.erl
