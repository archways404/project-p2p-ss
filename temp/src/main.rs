use winit::event_loop::EventLoop;
use winit::monitor::MonitorHandle;

fn main() {
    test1();
}

fn test1() {
    // Get the OS
    println!("Operating System: {}", std::env::consts::OS);

    // Create an event loop to access monitor information
    let event_loop = EventLoop::new();
    let monitors: Vec<MonitorHandle> = event_loop.available_monitors().collect();

    // Number of monitors
    println!("Number of Monitors: {}", monitors.len());

    // Print monitor resolutions
    for (i, monitor) in monitors.iter().enumerate() {
        let size = monitor.size();
        let position = monitor.position();
        println!(
            "Monitor {}: {}x{} @ ({}, {})",
            i + 1,
            size.width, size.height,
            position.x, position.y
        );
    }
}

fn test2() {}