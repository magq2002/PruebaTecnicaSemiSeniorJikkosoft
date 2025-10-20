package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func twoSum(nums []int, target int) []int {
	seen := make(map[int]int)
	for i, num := range nums {
		complement := target - num
		if j, ok := seen[complement]; ok {
			return []int{j, i}
		}
		seen[num] = i
	}
	return nil
}

func main() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Ingresa una lista de enteros separados por espacios: ") 
	input, _ := reader.ReadString('\n')
	input = strings.TrimSpace(input)
	input = strings.TrimSpace(input)
	strNums := strings.Split(input, " ")

	nums := make([]int, len(strNums))
	for i, str := range strNums {
		num, err := strconv.Atoi(str)
		if err != nil {
			fmt.Println("Error: debes ingresar solo números enteros.")
			return
		}
		nums[i] = num
	}

	fmt.Print("Ingresa el número objetivo (target): ")
	targetStr, _ := reader.ReadString('\n')
	targetStr = strings.TrimSpace(targetStr)
	target, err := strconv.Atoi(targetStr)
	if err != nil {
		fmt.Println("Error: el número objetivo debe ser un entero.")
		return
	}


	result := twoSum(nums, target)

	if result != nil {
		fmt.Printf("Los índices son: %v (valores: %d + %d = %d)\n",
			result, nums[result[0]], nums[result[1]], target)
	} else {
		fmt.Println("No se encontraron dos números que sumen el objetivo.")
	}

}