const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function SummaryTable() {
    return (
        <div className="w-full flex">
            <div className="grid grid-rows-7 grid-flow-row gap-3">
                {weekDays.map((weekDay, index) => {
                    return (
                        <div
                            key={index}
                            className="text-zinc-400 text-xl font-bold h-10 w-10 flex items-center justify-center"
                        >
                            {weekDay}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}