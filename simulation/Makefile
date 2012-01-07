all: simulation.beam
	mkdir -p ../nitrogen/lib/simulation
	cp simulation.beam ../nitrogen/lib/simulation/

simulation.beam: simulation.erl
	../nitrogen/erts-5.8.1/bin/erl -compile simulation.erl

clean:
	rm *.beam
