default: build

all: test

test: build
	cargo test

build:
	stellar contract build
	@ls -l target/wasm32-unknown-unknown/release/*.wasm

bindings:
	stellar contract bindings typescript --wasm ../../target/wasm32-unknown-unknown/release/hello_world.wasm --output-dir ../../bun_scripts/hello-world-sdk --overwrite

fmt:
	cargo fmt --all

clean:
	cargo clean
