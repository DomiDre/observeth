package main

import (
        "fmt"
        "bufio"
        "os"
        "strings"
        "strconv"
)

func main() {

    argument_list := os.Args[1:]
    datafile := argument_list[0]

    var output_file string
    if len(argument_list) > 1 {
        output_file = argument_list[1]
        if !strings.HasSuffix(output_file, ".js") {
            output_file = output_file + ".js"
        }
    } else {
        output_file = "cleaned_contract.js"
    }

    // Open file given in command line argument
    fi, err := os.Open(datafile)
    if err != nil {
        panic(err)
    }
    defer fi.Close()
    scanner := bufio.NewScanner(fi)

    
    // Open output file
    fo, err := os.Create(output_file)
    if err != nil {
        panic(err)
    }
    defer fo.Close()
    writer := bufio.NewWriter(fo)

    // Go over input file and rewrite into output file
    write_bin := false
    write_abi := false
    bin_counter := 0
    abi_counter := 0
    for scanner.Scan() {
        if write_bin {
            write_string := "var bin"
            if bin_counter>0 {
                write_string = write_string + strconv.Itoa(bin_counter)
            }
            fmt.Fprintln(writer, write_string + " = '0x" + scanner.Text()+"'" )
            writer.Flush()
            write_bin = false
            bin_counter++
            continue
        }

        if write_abi {
            write_string := "var abi"
            if abi_counter>0 {
                write_string = write_string + strconv.Itoa(abi_counter)
            }
            fmt.Fprintln(writer, write_string + " = " + scanner.Text())
            writer.Flush()
            write_abi = false
            abi_counter++
            continue
        }

        if strings.HasPrefix(scanner.Text(), "Binary") {
            write_bin = true
        }
        
        if strings.HasPrefix(scanner.Text(), "Contract JSON ABI") {
            write_abi = true
        }
    }
}