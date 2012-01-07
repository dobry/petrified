all: simulation.beam
	mkdir -p ../nitrogen/lib/simulation
	cp simulation.beam ../nitrogen/lib/simulation/

simulation.beam: simulation.erl
	erl -compile simulation.erl

clean:
	rm *.beam
