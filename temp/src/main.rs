use sys_info::{os_type, os_release, cpu_num, cpu_speed, mem_info};
use winit::event_loop::EventLoop;


fn main() {
    test1();
}

fn test1() {
    // Get OS Information safely
    match os_type() {
        Ok(os) => print!("OS: {}", os),
        Err(_) => println!("OS: Unknown"),
    }
    
    match os_release() {
        Ok(release) => println!(" {}", release),
        Err(_) => println!(""),
    }

    // Get CPU Info safely
    match cpu_num() {
        Ok(cpu) => println!("CPU Cores: {}", cpu),
        Err(_) => println!("CPU Cores: Unknown"),
    }

    match cpu_speed() {
        Ok(speed) => println!("CPU Speed: {} MHz", speed),
        Err(_) => println!("CPU Speed: Unknown"),
    }

    // Get RAM Info safely
    match mem_info() {
        Ok(mem) => {
            println!("Total RAM: {} MB", mem.total / 1024);
            println!("Available RAM: {} MB", mem.avail / 1024);
        }
        Err(_) => println!("Memory Info: Unavailable"),
    }

    // Get Monitor Information
    let event_loop = EventLoop::new();
    let monitors: Vec<_> = event_loop.available_monitors().collect();
    println!("Number of Monitors: {}", monitors.len());

    for (i, monitor) in monitors.iter().enumerate() {
        let size = monitor.size();
        println!("Monitor {}: {}x{}", i + 1, size.width, size.height);
    }
}

fn test2() {}